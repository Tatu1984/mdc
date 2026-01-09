using MDC.Core.Models;
using MDC.Core.Services.Providers.MDCDatabase;
using MDC.Core.Services.Providers.PVEClient;

namespace MDC.Core.Extensions;

internal static class PVEResourceExtensions
{
    public static bool ParseMDCResource(this PVEResource resource, out bool? isTemplate, out int? workspaceAddress, out string? type, out int? index, out string? name)
    {
        isTemplate = null;
        if (!MDCHelper.ParseMDCVirtualMachineName(resource.Name, resource.Template == true, out workspaceAddress, out type, out index, out name))
            return false;
        isTemplate = resource.Template == true;
        return true;
    }

    public static DatacenterEntry ToDatacenterEntry(this IEnumerable<PVEResource> pveResources, string site, DbWorkspace dbWorkspace, PVEClusterStatus clusterStatus, PVENodeStatus[] nodeStatuses, DatacenterSettings datacenterSettings)
    {
        var resourceEntries = pveResources.ParsePVEResources([dbWorkspace], false);
        return new DatacenterEntry
        {
            Site = site,
            DatacenterSettings = datacenterSettings,
            DatacenterNodeStatuses = nodeStatuses,
            DbDatacenter = dbWorkspace.Datacenter!,
            DatacenterClusterStatus = clusterStatus,
            Description = string.Empty,
            Nodes = pveResources.Where(i => i.Type == PVEResourceType.Node).ToArray(),
            Storage = pveResources.Where(i => i.Type == PVEResourceType.Storage).ToArray(),
            Workspaces = resourceEntries.WorkspaceEntries,
            BastionTemplates = resourceEntries.VirtualMachineTemplateEntries.Where(i => i.ResourceType == MDCHelper.MDCResourceType.Bastion),
            GatewayTemplates = resourceEntries.VirtualMachineTemplateEntries.Where(i => i.ResourceType == MDCHelper.MDCResourceType.Gateway),
            VirtualMachineTemplates = resourceEntries.VirtualMachineTemplateEntries.Where(i => i.ResourceType == MDCHelper.MDCResourceType.VirtualMachine)
        };
    }

    public static DatacenterEntry ToDatacenterEntry(this IEnumerable<PVEResource> pveResources, string site, DbDatacenter dbDatacenter, PVEClusterStatus clusterStatus, PVENodeStatus[] nodeStatuses, DatacenterSettings settings, bool createWorkspaceEntryFromPveResource)
    {
        var resourceEntries = pveResources.ParsePVEResources(dbDatacenter.Workspaces, createWorkspaceEntryFromPveResource);
        return new DatacenterEntry
        {
            Site = site,
            DatacenterSettings = settings,
            DatacenterNodeStatuses = nodeStatuses,
            DbDatacenter = dbDatacenter,
            DatacenterClusterStatus = clusterStatus,
            Description = string.Empty,
            Nodes = pveResources.Where(i => i.Type == PVEResourceType.Node).ToArray(),
            Storage = pveResources.Where(i => i.Type == PVEResourceType.Storage).ToArray(),
            Workspaces = resourceEntries.WorkspaceEntries,
            BastionTemplates = resourceEntries.VirtualMachineTemplateEntries.Where(i => i.ResourceType == MDCHelper.MDCResourceType.Bastion),
            GatewayTemplates = resourceEntries.VirtualMachineTemplateEntries.Where(i => i.ResourceType == MDCHelper.MDCResourceType.Gateway),
            VirtualMachineTemplates = resourceEntries.VirtualMachineTemplateEntries.Where(i => i.ResourceType == MDCHelper.MDCResourceType.VirtualMachine)
        };
    }

    private static (IEnumerable<WorkspaceEntry> WorkspaceEntries, IEnumerable<VirtualMachineTemplateEntry> VirtualMachineTemplateEntries) ParsePVEResources(this IEnumerable<PVEResource> pveResources, IEnumerable<DbWorkspace> dbWorkspaces, bool createWorkspaceEntryFromPveResource)
    {
        List<VirtualMachineTemplateEntry> templateEntries = new List<VirtualMachineTemplateEntry>();

        // First pass, create the workspace entries from the dbWorkspaces
        Dictionary<int, WorkspaceEntry> workspaceEntries = new Dictionary<int, WorkspaceEntry>();
        foreach (var dbWorkspace in dbWorkspaces)
        {
            // Note: There should not be any duplicate Addresses
            // TODO: Create a unique-key index on DbWorkspace.Address; should be a composite key (DatacenterId, Address)
            if (workspaceEntries.TryGetValue(dbWorkspace.Address, out var workspaceEntry))
            {
                // Duplicate Workspace Address found; throw an exception
                throw new InvalidOperationException($"Duplicate Workspace Address '{dbWorkspace.Address}' found for Workspaces '{workspaceEntry.Name}' and '{dbWorkspace.Name}' for Site '{dbWorkspace.Datacenter?.Name}'.");
            }
            
            workspaceEntry = new WorkspaceEntry
            {
                Address = dbWorkspace.Address,
                Name = dbWorkspace.Name,
                DbWorkspace = dbWorkspace,
                VirtualNetworks = dbWorkspace.VirtualNetworks
                    .Select(vn => new VirtualNetworkEntry
                    {
                        DbVirtualNetwork = vn,
                        Name = vn.Name,
                        Tag = vn.Tag,
                        Index = vn.Index,
                        PVEResource = null
                    })
                    .ToList()
            };
            
            workspaceEntries[dbWorkspace.Address] = workspaceEntry;
        }

        // Second pass, parse the PVE resources and populate the workspace entries
        foreach (var resource in pveResources)
        {
            if (!resource.ParseMDCResource(out var isTemplate, out var workspaceAddress, out var resourceType, out var resourceIndex, out var resourceName)) continue;

            // Parse templates
            if (isTemplate == true)
            {
                templateEntries.Add(new VirtualMachineTemplateEntry
                {
                    Name = resourceName!,
                    Index = resourceIndex!.Value,
                    ResourceType = resourceType!,
                    PVEResource = resource,
                });
                continue;
            }

            if (workspaceAddress == null) continue; // Skip invalid named resources

            if (!workspaceEntries.TryGetValue(workspaceAddress.Value, out var workspaceEntry))
            {
                if (!createWorkspaceEntryFromPveResource)
                {
                    // If the workspace entry does not exist already (from dbWorkspace) and we are not creating it from PVE resource, skip this resource
                    continue;
                }

                // If the workspace entry does not exist, create a new one
                workspaceEntry = new WorkspaceEntry
                {
                    Address = workspaceAddress.Value,
                    Name = string.Empty // Name will be set later based on the resource type
                };
                workspaceEntries[workspaceAddress.Value] = workspaceEntry;
            }
            // Populate the workspace entry based on the resource type
            switch (resourceType)
            {
                case MDCHelper.MDCResourceType.Bastion:
                    workspaceEntry.Bastion = new VirtualMachineEntry
                    {
                        PVEResource = resource,
                        Index = resourceIndex,
                        Name = resourceName
                    };
                    workspaceEntry.Name = resourceName ?? string.Empty; // Set the name to the resource name of the Bastion
                    break;
                case MDCHelper.MDCResourceType.VirtualMachine:
                    workspaceEntry.VirtualMachines.Add(new VirtualMachineEntry
                    {
                        PVEResource = resource,
                        Index = resourceIndex,
                        Name = resourceName
                    });
                    break;
                case MDCHelper.MDCResourceType.Gateway:
                    {
                        // Find the existing Virtual Network entry or throw an exception
                        var virtualNetworKEntry = workspaceEntry.VirtualNetworks.FirstOrDefault(vn => vn.Name == resourceName);

                        if (virtualNetworKEntry == null)
                        {
                            throw new InvalidOperationException($"Virtual Network '{resourceName}' not found in Workspace '{workspaceEntry.Name}' for Gateway resource '{resource.Name}'.");
                        }

                        // The Virtual Network Name and Index are already set from the DB; If they do not match, throw an exception
                        if (virtualNetworKEntry.Index != resourceIndex)
                        {
                            throw new InvalidOperationException($"Virtual Network '{resourceName}' index mismatch in Workspace '{workspaceEntry.Name}' for Gateway resource '{resource.Name}'. Expected index '{virtualNetworKEntry.Index}', found '{resourceIndex}'.");
                        }

                        virtualNetworKEntry.PVEResource = resource;

                        //if (vnEntry == null)
                        //{
                        //    vnEntry = new VirtualNetworkEntry
                        //    {
                        //        DbVirtualNetwork = null,    // Not known - Gateway created manually
                        //        PVEResource = resource,
                        //        Index = resourceIndex,
                        //        Name = resourceName,
                        //        Tag = null  // Not known until PVEQemuConfig property is set
                        //    };
                        //    workspaceEntry.VirtualNetworks.Add(vnEntry);
                        //}
                        //else
                        //{
                        //    vnEntry.PVEResource = resource;
                        //    vnEntry.Name = resourceName;
                        //}
                        break;
                    }
            }

        }

        // Third pass, create the WorkspaceDescriptor for each workspace entry
        foreach (var workspaceEntry in workspaceEntries.Values)
        {
            if (workspaceEntry.WorkspaceDescriptor != null) continue; // Already created

            workspaceEntry.WorkspaceDescriptor = new WorkspaceDescriptor
            {
                Name = workspaceEntry.Name,
                VirtualNetworks = workspaceEntry.VirtualNetworks
                    .Select(vn =>
                    {
                        string? templateName = null;
                        int? templateRevision = null;
                        var hasGatewayTemplate = vn.PVEResource != null && MDCHelper.GetMDCTemplateForResource(vn.PVEResource, pveResources, out var templateResource, out templateName, out templateRevision);
                        return new VirtualNetworkDescriptor
                        {
                            Name = vn.Name ?? string.Empty,
                            Gateway = !hasGatewayTemplate ? null : new VirtualNetworkGatewayDescriptor
                            {
                                TemplateName = templateName!,
                                TemplateRevision = templateRevision
                            },
                            EnableRemoteNetwork = vn.DbVirtualNetwork?.ZeroTierNetworkId != null,
                        };
                    })
                    .ToArray(),
                VirtualMachines = workspaceEntry.VirtualMachines
                    .Select(vm =>
                    {
                        string? templateName = null;
                        int? templateRevision = null;

                        // What template is used for this VM?  What happens if no template is found?
                        //if (vm.PVEResource == null || !MDCHelper.GetMDCTemplateForResource(vm.PVEResource, pveResources, out var templateResource, out templateName, out templateRevision))
                        //    throw new InvalidOperationException($"Virtual Machine '{vm.Name}' is missing required tag 'template_vmid' to identify its template.");

                        return vm.VirtualMachineDescriptor = new VirtualMachineDescriptor
                        {
                            Name = vm.Name ?? string.Empty,
                            TemplateName = templateName,
                            TemplateRevision = templateRevision
                        };
                    })
                    .ToArray()
            };

            string? templateName = null;
            int? templateRevision = null;
            if (workspaceEntry.Bastion?.PVEResource != null && MDCHelper.GetMDCTemplateForResource(workspaceEntry.Bastion.PVEResource, pveResources, out var templateResource, out templateName, out templateRevision))
            {
                workspaceEntry.WorkspaceDescriptor.Bastion = new BastionDescriptor
                {
                    TemplateName = templateName,
                    TemplateRevision = templateRevision
                };
            }
        }

        return (workspaceEntries.Values, templateEntries);
    }

    public static Dictionary<string, string?> GetTags(this PVEResource resource)
    {
        return (resource.Tags ?? string.Empty)
            .Split(';', StringSplitOptions.RemoveEmptyEntries)
            .Select(part => part.Split('.', 2, StringSplitOptions.RemoveEmptyEntries))
            .ToDictionary(parts => parts[0].Trim(), parts => parts.ElementAtOrDefault(1)?.Trim());
    }
}
