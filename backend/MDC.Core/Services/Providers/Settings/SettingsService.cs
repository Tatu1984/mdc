using MDC.Core.Extensions;
using MDC.Core.Models;
using MDC.Core.Services.Providers.MDCDatabase;
using MDC.Core.Services.Providers.PVEClient;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using System.Text.Json;

namespace MDC.Core.Services.Providers.Settings;

internal class SettingsService(IServiceProvider serviceProvider, ILogger<SettingsService> logger) : ISettingsService
{
    private IPVEClientService pve => serviceProvider.GetRequiredService<IPVEClientService>();
    private IMDCDatabaseService database => serviceProvider.GetRequiredService<IMDCDatabaseService>();

    private const string DatacenterSettings_MemoryCache_Key = "DatacenterSettings";

    public async Task<DatacenterEntry> GetDatacenterEntryAsync(bool createWorkspaceEntryFromPveResource = false, CancellationToken cancellationToken = default)
    {
        var clusterStatus = await pve.GetClusterStatusAsync(cancellationToken);
        var datacenterCluster = DatacenterFactory.GetDatacenterCluster(clusterStatus);
        
        var dbDatacenter = await database.GetDatacenterByNameAsync(datacenterCluster.Name, cancellationToken);
        if (dbDatacenter == null)
        {
            throw new InvalidOperationException($"Datacenter with name '{datacenterCluster.Name}' not found in the database.");
        }
        if (dbDatacenter.Workspaces == null)
        {
            throw new InvalidOperationException($"Unable to retrieve Workspaces for Datacenter '{datacenterCluster.Name}' from the database.");
        }

        var pveResources = await pve.GetClusterResourcesAsync(cancellationToken);
        var datacenterSettings = await GetDatacenterSettingsAsync(cancellationToken);
        var nodeStatuses = await QueryNodeStatusesAsync(clusterStatus.Where(i => i.Type == PVEClusterStatusType.Node).Select(i => i.Name), cancellationToken);
        var datacenterEntry = pveResources.ToDatacenterEntry(dbDatacenter, datacenterCluster, nodeStatuses, datacenterSettings, createWorkspaceEntryFromPveResource);

        // Populate Storage information for the Virtual Machine Template Entires
        await PopulateTemplateConfigurationAsync(datacenterEntry, cancellationToken);

        // Query the Configs for ALL Workspace VMs.
        if (createWorkspaceEntryFromPveResource)
            await PopulateVirtualNetworkEntriesAsync(datacenterEntry, cancellationToken);

        return datacenterEntry;
    }

    public async Task<DatacenterEntry> GetDatacenterEntryByWorkspaceIdAsync(Guid workspaceId, bool populateDatacenterTemplates = false, CancellationToken cancellationToken = default)
    {
        var dbWorkspace = await database.GetWorkspaceByIdAsync(workspaceId, cancellationToken);
        if (dbWorkspace == null)
        {
            throw new KeyNotFoundException($"Workspace Id '{workspaceId}' not found.");
        }

        var dbDatacenter = dbWorkspace.Datacenter;
        if (dbDatacenter == null)
            throw new InvalidOperationException($"Unable to retrieve Datacenter for Workspace Id '{workspaceId}'.");

        var clusterStatus = await pve.GetClusterStatusAsync(cancellationToken);
        var datacenterCluster = DatacenterFactory.GetDatacenterCluster(clusterStatus);

        if (dbDatacenter.Name != datacenterCluster.Name)
        {
            throw new InvalidOperationException($"Datacenter with name '{datacenterCluster.Name}' not found in the database.");
        }
        
        var pveResources = await pve.GetClusterResourcesAsync(cancellationToken);
        var datacenterSettings = await GetDatacenterSettingsAsync(cancellationToken);
        var nodeStatuses = await QueryNodeStatusesAsync(clusterStatus.Where(i => i.Type == PVEClusterStatusType.Node).Select(i => i.Name), cancellationToken);
        var datacenterEntry = pveResources.ToDatacenterEntry(dbWorkspace, datacenterCluster, nodeStatuses, datacenterSettings);

        // Populate Storage information for the Virtual Machine Template Entires
        if (populateDatacenterTemplates)
            await PopulateTemplateConfigurationAsync(datacenterEntry, cancellationToken);

        await PopulateVirtualNetworkEntriesAsync(datacenterEntry, cancellationToken);

        return datacenterEntry;
    }

    public async Task<DatacenterSettings> GetDatacenterSettingsAsync(CancellationToken cancellationToken = default)
    {
        var memoryCache = serviceProvider.GetRequiredService<IMemoryCache>();
        if (memoryCache.TryGetValue<DatacenterSettings>(DatacenterSettings_MemoryCache_Key, out var datacenterSettingsCache) && datacenterSettingsCache != null)
            return datacenterSettingsCache;

        var clusterOptions = await pve.GetClusterOptionsAsync(cancellationToken);

        DatacenterSettings? datacenterSettings = null;
        if (!string.IsNullOrWhiteSpace(clusterOptions.Description))
        {
            try
            {
                datacenterSettings = JsonSerializer.Deserialize<DatacenterSettings>(clusterOptions.Description, System.Text.Json.JsonSerializerOptions.Web);
                if (datacenterSettings != null)
                    memoryCache.Set(DatacenterSettings_MemoryCache_Key, datacenterSettings);
            }
            catch (JsonException ex)
            {
                logger.LogError(ex, "Unablet to deserialize Datacenter Settings from Cluster Options Description.");
            }
        }
        return datacenterSettings ?? new DatacenterSettings();
    }

    #region Private Methods

    private async Task<PVEQemuConfig?[]> QueryQemuConfigsAsync(IEnumerable<ResourceEntry> resourceEntries, CancellationToken cancellationToken)
    {
        return await Task.WhenAll(resourceEntries
            .Select(async re => re.PVEQemuConfig = await pve.GetQemuConfigAsync(re.PVEResource!.Node!, re.PVEResource.VmId!.Value, cancellationToken))
        );
    }

    private async Task<PVENodeStatus[]> QueryNodeStatusesAsync(IEnumerable<string> nodes, CancellationToken cancellationToken)
    {
        return await Task.WhenAll(nodes
            .Select(async node => await pve.GetNodeStatusAsync(node, cancellationToken))
        );
    }

    private async Task PopulateVirtualNetworkEntriesAsync(DatacenterEntry datacenterEntry, CancellationToken cancellationToken = default)
    {
        // Populate Virtual Network Entries for Workspace Entries
        var resourceEntries = datacenterEntry.Workspaces.Where(i => i.Address >= datacenterEntry.DatacenterSettings.MinWorkspaceAddress)
            .SelectMany(
                entry => entry.ResourceEntries
                    .Where(re => re.PVEQemuConfig == null && re.PVEResource != null && re.PVEResource.Node != null && re.PVEResource.VmId.HasValue),
                (workspaceEntry, resourceEntry) => resourceEntry);
        _ = await QueryQemuConfigsAsync(resourceEntries, cancellationToken);
        foreach (var workspaceEntry in datacenterEntry.Workspaces.Where(i => i.Address >= datacenterEntry.DatacenterSettings.MinWorkspaceAddress))
        {
            if (workspaceEntry.Bastion == null || workspaceEntry.Bastion.PVEQemuConfig == null) continue;   // Skip the Workspaces where a Virtual Network record cannot be created

            // Update the VirtualNetworkEntry Tag values based on the QemuConfig NetworkInterface and DbVirtualNetwork based on the Tag
            foreach (var virtualNetworkEntry in workspaceEntry.VirtualNetworks
                .Where(virtualNetworkEntry => virtualNetworkEntry.PVEResource != null && virtualNetworkEntry.PVEQemuConfig != null))
            {
                var (wanNetworkAdapter, lanNetworkAdapter) = virtualNetworkEntry.PVEQemuConfig!.ParseGatewayNetworkAdapters();

                // The lanNetworkAdapter Tag is expected to have a valid value
                //if (lanNetworkAdapter.Tag == null || lanNetworkAdapter.Tag.Value < minWorkspaceAddress)   // TODO: Get the minimum tag value from Datacenter Settings
                //    throw new InvalidOperationException($"Workspace '{workspaceEntry.Address}' Gateway Virtual Machine '{virtualNetworkEntry.PVEResource!.Name}' Network Adapter '{lanNetworkAdapter.DeviceId}' has invalid Tag value '{Convert.ToString(lanNetworkAdapter.Tag) ?? "<none>"}'.");

                // If the wanNetworkAdapter Tag has a value, it is expected to be valid
                if (wanNetworkAdapter != null
                    && !(
                        // Valid Egress WAN Tag
                        (wanNetworkAdapter.Bridge == datacenterEntry.DatacenterSettings.WanBridgeName && wanNetworkAdapter.Tag == datacenterEntry.DatacenterSettings.WanBridgeTag)
                        ||
                        // Valid Internal WAN tag
                        (wanNetworkAdapter.Bridge == datacenterEntry.DatacenterSettings.LanBridgeName && wanNetworkAdapter.Tag != null && wanNetworkAdapter.Tag.Value >= datacenterEntry.DatacenterSettings.MinVirtualNetworkTag)
                       )
                    )
                    logger.LogError(new InvalidOperationException($"Workspace '{workspaceEntry.Address}' Gateway Virtual Machine '{virtualNetworkEntry.PVEResource!.Name}' Network Adapter '{wanNetworkAdapter.DeviceId}' has invalid Tag value '{Convert.ToString(wanNetworkAdapter.Tag) ?? "<none>"}'."), "Unexpected Virtual Machine Configuration");

                if (virtualNetworkEntry.DbVirtualNetwork != null)
                {
                    System.Diagnostics.Debugger.Break();
                }

                virtualNetworkEntry.Tag = lanNetworkAdapter?.Tag;

                // Note: When repopulating the datatabase, DbWorkspace will be null
                virtualNetworkEntry.DbVirtualNetwork = workspaceEntry.DbWorkspace?.VirtualNetworks.FirstOrDefault(i => i.Tag == virtualNetworkEntry.Tag);
            }

            // Find all of the network interfaces from the Qemu Configs for the Workspace Bastion and create Virtual Network Entries where there is none already - These are the Virtual Networks with no gateway
            foreach (var networkAdapter in workspaceEntry.Bastion.PVEQemuConfig.ParseNetworkAdapters())
            {
                if (networkAdapter.Tag == null)
                    continue;   // Skip network interfaces with no tag

                if (workspaceEntry.VirtualNetworks.Any(i => i.Tag.HasValue && i.Tag.Value == networkAdapter.Tag.Value))
                    continue;   // Skip if there is already a Virtual Network Entry for this tag

                // Add Virtual Network with no Gateway VM
                workspaceEntry.VirtualNetworks.Add(new VirtualNetworkEntry
                {
                    Index = networkAdapter.DeviceIndex,
                    Name = networkAdapter.DeviceId,
                    Tag = networkAdapter.Tag,
                    DbVirtualNetwork = workspaceEntry.DbWorkspace?.VirtualNetworks.FirstOrDefault(i => i.Tag == networkAdapter.Tag),
                    PVEResource = null
                });
            }

            // Update the NetworkAdapter in the WorkspaceDescriptor for each of the VirtualMachines
            foreach (var virtualMachine in workspaceEntry.VirtualMachines.Where(i => i.PVEResource != null && i.PVEQemuConfig != null))
            {
                if (virtualMachine.VirtualMachineDescriptor == null) continue;  // Skip.  Note: This should never happen

                var networkAdapters = virtualMachine.PVEQemuConfig?.ParseNetworkAdapters(); // Force parsing of the config to populate the network adapters
                
                virtualMachine.VirtualMachineDescriptor.NetworkAdapters = networkAdapters?
                    .Select(na => new VirtualMachineNetworkAdapterDescriptor
                    {
                        Name = na.DeviceId,
                        IsDisconnected = na.IsDisconnected,
                        MACAddress = na.MACAddress,
                        IsFirewallEnabled = na.IsFirewallEnabled,
                        RefVirtualNetworkName = na.Tag == null ? null : workspaceEntry.VirtualNetworks.FirstOrDefault(vn => vn.Tag == na.Tag)?.Name,
                    })
                    .ToArray();
            }
        }
    }

    private async Task PopulateTemplateConfigurationAsync(DatacenterEntry datacenterEntry, CancellationToken cancellationToken = default)
    {
        // Populate Storage information for the Virtual Machine Template Entires
        var templateEntries = datacenterEntry.BastionTemplates
            .Concat(datacenterEntry.GatewayTemplates)
            .Concat(datacenterEntry.VirtualMachineTemplates);
        _ = await QueryQemuConfigsAsync(templateEntries, cancellationToken);
        foreach (var virtualMachineTemplateEntry in templateEntries)
        {
            if (virtualMachineTemplateEntry.PVEQemuConfig == null || virtualMachineTemplateEntry.PVEResource == null || virtualMachineTemplateEntry.Storage != null) continue;    // Skip.  Note: This should never happen
            virtualMachineTemplateEntry.Storage = virtualMachineTemplateEntry.PVEQemuConfig.ParseStorage();
        }
    }
    #endregion
}
