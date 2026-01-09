using MDC.Core.Services.Providers.MDCDatabase;
using MDC.Core.Services.Providers.PVEClient;

namespace MDC.Core.Models;

internal static class DatacenterFactory
{
    public static async Task<DatacenterEntry> GetDatacenterEntryAsync(string site, IPVEClientService pveClient, IMDCDatabaseService databaseService, bool createWorkspaceEntryFromPveResource = false, CancellationToken cancellationToken = default)
    {
        var clusterStatus = await pveClient.GetClusterStatusAsync(cancellationToken);
        var datacenterCluster = DatacenterFactory.GetDatacenterCluster(clusterStatus);

        if (site != datacenterCluster.Name)
        {
            throw new InvalidOperationException($"Datacenter with name '{datacenterCluster.Name}' does not match the requested site '{site}'.");
        }

        var dbDatacenter = await databaseService.GetDatacenterByNameAsync(datacenterCluster.Name, cancellationToken);
        if (dbDatacenter == null)
        {
            throw new InvalidOperationException($"Datacenter with name '{datacenterCluster.Name}' not found in the database.");
        }
        if (dbDatacenter.Workspaces == null)
        {
            throw new InvalidOperationException($"Unable to retrieve Workspaces for Datacenter '{datacenterCluster.Name}' from the database.");
        }

        var pveResources = await pveClient.GetClusterResourcesAsync(cancellationToken);
        var datacenterSettings = await pveClient.GetDatacenterSettingsAsync(cancellationToken);
        var nodeStatuses = await QueryNodeStatusesAsync(pveClient, clusterStatus.Where(i => i.Type == PVEClusterStatusType.Node).Select(i => i.Name), cancellationToken);
        var datacenterEntry = pveResources.ToDatacenterEntry(site, dbDatacenter, datacenterCluster, nodeStatuses, datacenterSettings, createWorkspaceEntryFromPveResource);

        // Populate Storage information for the Virtual Machine Template Entires
        await PopulateTemplateConfigurationAsync(pveClient, datacenterEntry, cancellationToken);

        // Query the Configs for ALL Workspace VMs.
        if (createWorkspaceEntryFromPveResource)
            await PopulateVirtualNetworkEntriesAsync(pveClient,datacenterEntry, cancellationToken);

        return datacenterEntry;
    }

    public static async Task<DatacenterEntry> GetDatacenterEntryByWorkspaceIdAsync(string site, IPVEClientService pveClient, IMDCDatabaseService databaseService, Guid workspaceId, bool populateDatacenterTemplates = false, CancellationToken cancellationToken = default)
    {
        var dbWorkspace = await databaseService.GetWorkspaceByIdAsync(workspaceId, cancellationToken);
        if (dbWorkspace == null)
        {
            throw new KeyNotFoundException($"Workspace Id '{workspaceId}' not found.");
        }

        var dbDatacenter = dbWorkspace.Datacenter;
        if (dbDatacenter == null)
            throw new InvalidOperationException($"Unable to retrieve Datacenter for Workspace Id '{workspaceId}'.");

        var clusterStatus = await pveClient.GetClusterStatusAsync(cancellationToken);
        var datacenterCluster = DatacenterFactory.GetDatacenterCluster(clusterStatus);

        if (dbDatacenter.Name != datacenterCluster.Name)
        {
            throw new InvalidOperationException($"Datacenter with name '{datacenterCluster.Name}' not found in the database.");
        }

        var pveResources = await pveClient.GetClusterResourcesAsync(cancellationToken);
        var datacenterSettings = await pveClient.GetDatacenterSettingsAsync(cancellationToken);
        var nodeStatuses = await QueryNodeStatusesAsync(pveClient,clusterStatus.Where(i => i.Type == PVEClusterStatusType.Node).Select(i => i.Name), cancellationToken);
        var datacenterEntry = pveResources.ToDatacenterEntry(site, dbWorkspace, datacenterCluster, nodeStatuses, datacenterSettings);

        // Populate Storage information for the Virtual Machine Template Entires
        if (populateDatacenterTemplates)
            await PopulateTemplateConfigurationAsync(pveClient, datacenterEntry, cancellationToken);

        await PopulateVirtualNetworkEntriesAsync(pveClient, datacenterEntry, cancellationToken);

        return datacenterEntry;

    }
    private static async Task<PVENodeStatus[]> QueryNodeStatusesAsync(IPVEClientService pveClient, IEnumerable<string> nodes, CancellationToken cancellationToken)
    {
        return await Task.WhenAll(nodes
            .Select(async node => await pveClient.GetNodeStatusAsync(node, cancellationToken))
        );
    }

    private static async Task PopulateTemplateConfigurationAsync(IPVEClientService pveClient, DatacenterEntry datacenterEntry, CancellationToken cancellationToken = default)
    {
        // Populate Storage information for the Virtual Machine Template Entires
        var templateEntries = datacenterEntry.BastionTemplates
            .Concat(datacenterEntry.GatewayTemplates)
            .Concat(datacenterEntry.VirtualMachineTemplates);
        _ = await QueryQemuConfigsAsync(pveClient, templateEntries, cancellationToken);
        foreach (var virtualMachineTemplateEntry in templateEntries)
        {
            if (virtualMachineTemplateEntry.PVEQemuConfig == null || virtualMachineTemplateEntry.PVEResource == null || virtualMachineTemplateEntry.Storage != null) continue;    // Skip.  Note: This should never happen
            virtualMachineTemplateEntry.Storage = virtualMachineTemplateEntry.PVEQemuConfig.ParseStorage();
        }
    }

    private static async Task<PVEQemuConfig?[]> QueryQemuConfigsAsync(IPVEClientService pveClient, IEnumerable<ResourceEntry> resourceEntries, CancellationToken cancellationToken)
    {
        return await Task.WhenAll(resourceEntries
            .Select(async re => re.PVEQemuConfig = await pveClient.GetQemuConfigAsync(re.PVEResource!.Node!, re.PVEResource.VmId!.Value, cancellationToken))
        );
    }

    private static async Task PopulateVirtualNetworkEntriesAsync(IPVEClientService pveClient, DatacenterEntry datacenterEntry, CancellationToken cancellationToken = default)
    {
        // Populate Virtual Network Entries for Workspace Entries
        var resourceEntries = datacenterEntry.Workspaces.Where(i => i.Address >= datacenterEntry.DatacenterSettings.MinWorkspaceAddress)
            .SelectMany(
                entry => entry.ResourceEntries
                    .Where(re => re.PVEQemuConfig == null && re.PVEResource != null && re.PVEResource.Node != null && re.PVEResource.VmId.HasValue),
                (workspaceEntry, resourceEntry) => resourceEntry);
        _ = await QueryQemuConfigsAsync(pveClient, resourceEntries, cancellationToken);
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
                    // logger.LogError(new InvalidOperationException($"Workspace '{workspaceEntry.Address}' Gateway Virtual Machine '{virtualNetworkEntry.PVEResource!.Name}' Network Adapter '{wanNetworkAdapter.DeviceId}' has invalid Tag value '{Convert.ToString(wanNetworkAdapter.Tag) ?? "<none>"}'."), "Unexpected Virtual Machine Configuration");

                    if (virtualNetworkEntry.DbVirtualNetwork == null)   // Note: This should never happen because DbVirtaulNetwork is created when the WorkspaceEntry is created
                    {
                        System.Diagnostics.Debugger.Break();
                    }

                //if (virtualNetworkEntry.DbVirtualNetwork != null)
                //{
                //    System.Diagnostics.Debugger.Break();
                //}

                //virtualNetworkEntry.Tag = lanNetworkAdapter?.Tag;

                //// Note: When repopulating the datatabase, DbWorkspace will be null
                //virtualNetworkEntry.DbVirtualNetwork = workspaceEntry.DbWorkspace?.VirtualNetworks.FirstOrDefault(i => i.Tag == virtualNetworkEntry.Tag);
            }

            // Find all of the network interfaces from the Qemu Configs for the Workspace Bastion and create Virtual Network Entries where there is none already - These are the Virtual Networks with no gateway
            foreach (var networkAdapter in workspaceEntry.Bastion.PVEQemuConfig.ParseNetworkAdapters())
            {
                if (networkAdapter.Tag == null)
                    continue;   // Skip network interfaces with no tag

                // Throw an exception if there is not a Virtual Network Entry for this tag.  There is a Gateway VM specified for this tag
                var virtualNetworkEntry = workspaceEntry.VirtualNetworks.FirstOrDefault(i => i.Tag.HasValue && i.Tag.Value == networkAdapter.Tag.Value) 
                    ?? throw new InvalidOperationException($"Workspace '{workspaceEntry.Address}' Bastion Virtual Machine '{workspaceEntry.Bastion.PVEResource!.Name}' Network Adapter '{networkAdapter.DeviceId}' has Tag value '{networkAdapter.Tag.Value}' with no corresponding Virtual Network Entry.");

                // The Virtual Network Index must match the network adapter device index
                if (virtualNetworkEntry.Index != networkAdapter.DeviceIndex)
                {
                    throw new InvalidOperationException($"Workspace '{workspaceEntry.Address}' Bastion Virtual Machine '{workspaceEntry.Bastion.PVEResource!.Name}' Network Adapter '{networkAdapter.DeviceId}' has Tag value '{networkAdapter.Tag.Value}' with mismatched Virtual Network Entry index '{virtualNetworkEntry.Index}' (expected '{networkAdapter.DeviceIndex}').");
                }
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










    public static PVEClusterStatus GetDatacenterCluster(IEnumerable<PVEClusterStatus> clusterStatus)
    {
        // This method should return the datacenter name from the cluster status.
        if (clusterStatus.Count() == 1)
        {
            // Single Node Cluster
            var node = clusterStatus.Single();
            if (node.Type != PVEClusterStatusType.Node)
            {
                throw new InvalidOperationException("Expected a single node cluster with type 'node'.");
            }
            return node;
        }
        else
        {
            // Multi Node Cluster
            var cluster = clusterStatus.FirstOrDefault(x => x.Type == PVEClusterStatusType.Cluster);
            if (cluster == null)
            {
                throw new InvalidOperationException("Expected a cluster type in multi node cluster status.");
            }
            return cluster;
        }
    }

    public static Datacenter ToDatacenter(DatacenterEntry datacenterEntry)
    {
        return new Datacenter
        {
            DatacenterSettings = datacenterEntry.DatacenterSettings,
            DatacenterNodes = datacenterEntry.DatacenterNodeStatuses.Select(entry => new DatacenterNode
            { 
                CPUInfo = new DatacenterNodeCPUInfo
                {
                    Cores = entry.CPUInfo.Cores,
                    CPUs = entry.CPUInfo.CPUs,
                    MHZ = entry.CPUInfo.MHZ,
                    Model = entry.CPUInfo.Model,
                    Sockets = entry.CPUInfo.Sockets
                }
            }).ToArray(),
            Id = datacenterEntry.DbDatacenter.Id,
            Name = datacenterEntry.DbDatacenter.Name,
            Description = datacenterEntry.DbDatacenter.Description,
            Workspaces = ToWorkspaces(datacenterEntry.Workspaces),
            BastionTemplates = datacenterEntry.BastionTemplates.Select(entry => ToVirtualMachineTemplate(entry)).ToArray(),
            GatewayTemplates = datacenterEntry.GatewayTemplates.Select(entry => ToVirtualMachineTemplate(entry)).ToArray(),
            VirtualMachineTemplates = datacenterEntry.VirtualMachineTemplates.Select(entry => ToVirtualMachineTemplate(entry)).ToArray(),
            DeviceConfigurations = []
        };
    }

    public static VirtualMachine ToVirtualMachine(VirtualMachineEntry? entry, IEnumerable<VirtualNetworkEntry> virtualNetworks)
    {
        return new VirtualMachine
        {
            Index = entry?.Index ?? 0,
            Name = entry?.Name ?? string.Empty,
            Status = entry?.PVEQemuStatus?.Qmpstatus ?? "unknown",
            NetworkAdapters = entry?.PVEQemuConfig == null ? null :
                entry.PVEQemuConfig.ParseNetworkAdapters().Select(networkDevice => new VirtualMachineNetworkAdapter
                {
                    Name = networkDevice.DeviceId,
                    IsDisconnected = networkDevice.IsDisconnected ?? false,
                    MACAddress = networkDevice.MACAddress,
                    VirtualNetworkId = virtualNetworks.FirstOrDefault(vn => vn.Tag == networkDevice.Tag)?.DbVirtualNetwork?.Id,
                    NetworkInterfaces = entry.PVEQemuAgentNetworkInterfaces?
                        .Select(ni => new VirtualMachineNetworkInterface
                        {
                            Name = ni.Name,
                            MACAddress = ni.MACAddress,
                            IPAddress = ni.IPAddress?.ToString(),
                            Prefix = ni.Prefix
                        })
                        .ToArray()
                })
                .ToArray()
        };
    }

    public static Workspace[] ToWorkspaces(IEnumerable<WorkspaceEntry> workspaceEntries)
    {
        return workspaceEntries
                .Where(entry => entry.DbWorkspace != null && entry.DbWorkspace.Id != Guid.Empty)
                .Select(entry => new Workspace
                {
                    Id = entry.DbWorkspace!.Id,
                    Address = entry.Address,
                    Name = entry.Name,
                    CreatedAt = entry.DbWorkspace.CreatedAt,
                    UpdatedAt = entry.DbWorkspace.UpdatedAt,
                    Description = entry.Bastion?.PVEQemuConfig?.Description,
                    Bastion = DatacenterFactory.ToVirtualMachine(entry.Bastion, entry.VirtualNetworks),
                    VirtualNetworks = DatacenterFactory.ToVirtualNetworks(entry.VirtualNetworks),
                    VirtualMachines = entry.VirtualMachines.Select(vm => DatacenterFactory.ToVirtualMachine(vm, entry.VirtualNetworks)).ToArray(),
                    Devices = [],
                    Users = []
                })
                .ToArray();
    }

    public static VirtualNetwork[] ToVirtualNetworks(IEnumerable<VirtualNetworkEntry> virtualNetworkEntries)
    {
        return virtualNetworkEntries
                .Where(entry => entry.DbVirtualNetwork != null && entry.DbVirtualNetwork.Id != Guid.Empty && entry.Name != null)
                .Select(entry => new VirtualNetwork
                {
                    Id = entry.DbVirtualNetwork!.Id,
                    Index = entry.DbVirtualNetwork.Index,
                    Name = entry.Name!,
                    Tag = entry.Tag,
                    RemoteNetworkId = entry.DbVirtualNetwork.ZeroTierNetworkId,
                })
                .ToArray();
    }

    private static VirtualMachineTemplate ToVirtualMachineTemplate(VirtualMachineTemplateEntry entry)
    {
        return new VirtualMachineTemplate
        {
            Name = entry.Name!,
            Revision = entry.Index!.Value,
            Cores = entry.PVEQemuConfig?.Cores,
            Memory = entry.PVEQemuConfig?.Memory,
            Storage = (entry.Storage ?? []).Select(i => new VirtualMachineTemplateStorage
            {
                ControllerType = i.ControllerType,
                ControllerIndex = i.ControllerIndex,
                Size = i.GetSize()
            })
            .ToArray()
        };
    }
}
