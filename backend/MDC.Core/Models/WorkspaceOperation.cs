using MDC.Core.Services.Providers.MDCDatabase;
using MDC.Core.Services.Providers.PVEClient;
using MDC.Core.Services.Providers.ZeroTier;
using MDC.Shared.Models;
using System.Net;

namespace MDC.Core.Models;

internal abstract class WorkspaceOperation
{
    public virtual WorkspaceOperationTask[] GenerateTasks(IPVEClientService pve, IZeroTierService zeroTier, IMDCDatabaseService database, DatacenterEntry datacenterEntry, DbWorkspace dbWorkspace, CancellationToken cancellationToken) => Array.Empty<WorkspaceOperationTask>();
}

internal abstract class CloneVirtualMachineOperation : WorkspaceOperation
{
    public required string TargetNode;
    public required VirtualMachineTemplateEntry TemplateEntry;

    protected int? vmid = null;

    protected WorkspaceOperationTask CloneVirtualMachineTask(IPVEClientService pve, string virtualMachineName, int order, CancellationToken cancellationToken)
    {
        if (TemplateEntry.PVEResource == null)
            throw new InvalidOperationException($"Template PVE Resource is null for Template '{TemplateEntry.Name}'");
        if (TemplateEntry.PVEResource.Node == null)
            throw new InvalidOperationException($"Template Node is null for Template '{TemplateEntry.Name}'");
        if (TemplateEntry.PVEResource.VmId == null)
            throw new InvalidOperationException($"Template VMID is null for Template '{TemplateEntry.Name}'");

        return new WorkspaceOperationTask
        {
            WorkspaceOperationTaskType = WorkspaceOperationTaskType.CloneVirtualMachine,
            Order = order,
            ExecuteAsync = async () =>
            {
                (vmid, var upid) = await pve.CreateQemuCloneAsync(TemplateEntry.PVEResource.Node!, TemplateEntry.PVEResource.VmId.Value, virtualMachineName, TargetNode, cancellationToken);
                await pve.WaitForTaskAsync(TemplateEntry.PVEResource.Node!, upid, cancellationToken);
            }
        };
    }

    protected WorkspaceOperationTask StartVirtualMachineTask(IPVEClientService pve, bool waitForIPAddress, CancellationToken cancellationToken)
    {
        return new WorkspaceOperationTask
        {
            WorkspaceOperationTaskType = WorkspaceOperationTaskType.StartVirtualMachine,
            ExecuteAsync = async () =>
            {
                if (vmid == null) throw new InvalidOperationException($"VMID is null for cloned VM on node '{TargetNode}'");
                var vmStatus = await pve.QemuStatusStartAsync(TargetNode, vmid.Value, waitForIPAddress ? QemuWaitOptions.WaitForIPAddress : QemuWaitOptions.WaitForState, cancellationToken);
            }
        };
    }
}

internal class CloneBastionVirtualMachineOperation : CloneVirtualMachineOperation
{
    public required string VirtualMachineName;
    public required VirtualNetworkDescriptor[] VirtualNetworkDescriptors;

    public override WorkspaceOperationTask[] GenerateTasks(IPVEClientService pve, IZeroTierService zeroTier, IMDCDatabaseService database, DatacenterEntry datacenterEntry, DbWorkspace dbWorkspace, CancellationToken cancellationToken)
    {
        List<WorkspaceOperationTask> tasks = new();
        tasks.Add(CloneVirtualMachineTask(pve, MDCHelper.FormatVirtualMachineName(dbWorkspace.Address, MDCHelper.MDCResourceType.Bastion, 0, VirtualMachineName), 1, cancellationToken));

        tasks.Add(new WorkspaceOperationTask
        {
            WorkspaceOperationTaskType = WorkspaceOperationTaskType.UpdateVirtualMachineConfiguration,
            ExecuteAsync = async () => 
            {
                if (vmid == null) throw new InvalidOperationException($"VMID is null for cloned VM '{VirtualMachineName}' on node '{TargetNode}'");
                var qemuConfig = await pve.GetQemuConfigAsync(TargetNode, vmid.Value, cancellationToken) ?? throw new InvalidOperationException($"Unable to get Qemu Config for Workspace Address '{dbWorkspace.Address}' VM VMID '{vmid.Value}' on node '{TargetNode}'");

                // Remove all of the existing network devices and add new ones
                var networkAdapters = dbWorkspace.VirtualNetworks.Select(dbVirtualNetwork => new PVEQemuConfigNetworkAdapter
                {
                    DeviceId = $"net{dbVirtualNetwork.Index}",
                    DeviceIndex = dbVirtualNetwork.Index,
                    Bridge = datacenterEntry.DatacenterSettings.LanBridgeName,
                    Tag = dbVirtualNetwork.Tag,
                    IsFirewallEnabled = true,
                    IsDisconnected = false,
                    Model = "virtio"
                })
                .ToArray();
                var existingNetworkAdapters = qemuConfig.ParseNetworkAdapters();
                var deleteProperties = existingNetworkAdapters.Select(i => i.DeviceId).Except(networkAdapters.Select(i => i.DeviceId));
                var upid = await pve.UpdateQemuConfigAsync(TargetNode, vmid.Value, null, networkAdapters, deleteProperties, cancellationToken);
                await pve.WaitForTaskAsync(TargetNode, upid, cancellationToken);
            }
        });

        // For each of the remote networks, if enabled, we need to add the Bastion VM to the ZeroTier network
        bool waitForIPAddress = false;
        foreach (var virtualNetworkDescriptor in VirtualNetworkDescriptors.Where(i => i.EnableRemoteNetwork == true))
        {
            waitForIPAddress = true;

            tasks.Add(new WorkspaceOperationTask
            {
                WorkspaceOperationTaskType = WorkspaceOperationTaskType.JoinZeroTierNetwork,
                ExecuteAsync = async () =>
                {
                    if (vmid == null) throw new InvalidOperationException($"VMID is null for cloned VM '{VirtualMachineName}' on node '{TargetNode}'");
                    var dbVirtualNetwork = dbWorkspace.VirtualNetworks.FirstOrDefault(i => i.Name == virtualNetworkDescriptor.Name) ?? throw new InvalidOperationException($"Virtual Network Name '{virtualNetworkDescriptor.Name}' does not exist in Workspace {dbWorkspace.Address}");

                    if (dbVirtualNetwork.ZeroTierNetworkId == null)
                        throw new InvalidOperationException($"ZeroTier Network has not been created for Virtual Network '{dbVirtualNetwork.Name}' in Workspace {dbWorkspace.Address}");

                    // Install ZeroTier on the Bastion VM 
                    var installZeroTierResponse = await zeroTier.InstallZeroTierAsync(datacenterEntry.Site, TargetNode, vmid.Value, cancellationToken);

                    // Join to the ZeroTier Network
                    IPAddress[] ipAddresses = string.IsNullOrEmpty(virtualNetworkDescriptor.RemoteNetworkBastionIPAddress) ? [] : [IPAddress.Parse(virtualNetworkDescriptor.RemoteNetworkBastionIPAddress)];
                    var networkMembership = await zeroTier.JoinNetworkAsync(datacenterEntry.Site, TargetNode, vmid.Value, dbVirtualNetwork.ZeroTierNetworkId, "Bastion", ipAddresses, datacenterEntry.DatacenterSettings, cancellationToken);
                }
            });
        }

        tasks.Add(StartVirtualMachineTask(pve, waitForIPAddress, cancellationToken));

        return tasks.ToArray();
    }
}

internal class CloneGatewayVirtualMachineOperation : CloneVirtualMachineOperation
{
    public required int Index;
    public required VirtualNetworkDescriptor VirtualNetworkDescriptor;

    public override WorkspaceOperationTask[] GenerateTasks(IPVEClientService pve, IZeroTierService zeroTier, IMDCDatabaseService database, DatacenterEntry datacenterEntry, DbWorkspace dbWorkspace, CancellationToken cancellationToken)
    {
        List<WorkspaceOperationTask> tasks = new();
        
        if (VirtualNetworkDescriptor.Name == null) throw new InvalidOperationException($"Virtual Network Name is null for Virtual Network Index '{Index}'");

        tasks.Add(CloneVirtualMachineTask(pve, MDCHelper.FormatVirtualMachineName(dbWorkspace.Address, MDCHelper.MDCResourceType.Gateway, Index, VirtualNetworkDescriptor.Name), 2, cancellationToken));

        tasks.Add(new WorkspaceOperationTask
        {
            WorkspaceOperationTaskType = WorkspaceOperationTaskType.UpdateVirtualMachineConfiguration,
            ExecuteAsync = async () =>
            {
                if (vmid == null) throw new InvalidOperationException($"VMID is null for cloned Virtual Network Gateway VM '{VirtualNetworkDescriptor.Name}' on node '{TargetNode}'");
                var qemuConfig = await pve.GetQemuConfigAsync(TargetNode, vmid.Value, cancellationToken) ?? throw new InvalidOperationException($"Unable to get Qemu Config for Workspace Address '{dbWorkspace.Address}' VM VMID '{vmid.Value}' on node '{TargetNode}'");

                var (wanNetworkAdapter, lanNetworkAdapter) = qemuConfig.ParseGatewayNetworkAdapters();
                if (wanNetworkAdapter == null)
                {
                    var deviceIds = Enumerable.Range(0, 2).Select(i => $"vnet{i}");
                    var deviceIndex = Enumerable.Range(0, 2);
                    wanNetworkAdapter = new PVEQemuConfigNetworkAdapter
                    {
                        DeviceId = deviceIds.Except([lanNetworkAdapter.DeviceId]).First(),
                        DeviceIndex = deviceIndex.Except([lanNetworkAdapter.DeviceIndex]).First()
                    };
                }

                switch (VirtualNetworkDescriptor?.Gateway?.WANNetworkType)
                {
                    case VirtualNetworkGatewayWANNetworkType.Egress:
                        {
                            wanNetworkAdapter.Bridge = datacenterEntry.DatacenterSettings.WanBridgeName;
                            wanNetworkAdapter.Tag = datacenterEntry.DatacenterSettings.WanBridgeTag;
                            break;
                        }
                    case VirtualNetworkGatewayWANNetworkType.Internal:
                        {
                            wanNetworkAdapter.Bridge = datacenterEntry.DatacenterSettings.LanBridgeName;
                            // Note: These should be already validated from the Normalize() phase before Virtual Machines are created, and not fail at this stage, leaving an incomplete Workspace creation
                            var dbVirtualNetwork = dbWorkspace.VirtualNetworks.FirstOrDefault(i => i.Name == VirtualNetworkDescriptor.Gateway.RefInternalWANVirtualNetworkName!) ?? throw new InvalidOperationException($"Virtual Network Name '{VirtualNetworkDescriptor.Gateway.RefInternalWANVirtualNetworkName}' does not existing in Workspace {dbWorkspace.Address}");
                            wanNetworkAdapter.Tag = dbVirtualNetwork.Tag;
                            break;
                        }
                    case VirtualNetworkGatewayWANNetworkType.Public:
                        {
                            wanNetworkAdapter.Bridge = datacenterEntry.DatacenterSettings.PublicBridgeName;
                            wanNetworkAdapter.Tag = datacenterEntry.DatacenterSettings.PublicBridgeTag;
                            break;
                        }
                    default:
                        throw new InvalidOperationException($"Unknown Gateway WAN Type '{VirtualNetworkDescriptor?.Gateway?.WANNetworkType}'");
                }

                wanNetworkAdapter.IsFirewallEnabled = true;
                wanNetworkAdapter.IsDisconnected = false;

                lanNetworkAdapter.Bridge = datacenterEntry.DatacenterSettings.LanBridgeName;
                lanNetworkAdapter.Tag = dbWorkspace.VirtualNetworks.Single(i => i.Name == VirtualNetworkDescriptor.Name).Tag;
                lanNetworkAdapter.IsFirewallEnabled = true;
                lanNetworkAdapter.IsDisconnected = false;
                var upid = await pve.UpdateQemuConfigAsync(TargetNode, vmid.Value, null, [wanNetworkAdapter, lanNetworkAdapter], [], cancellationToken);
                await pve.WaitForTaskAsync(TargetNode, upid, cancellationToken);
            }
        });

        tasks.Add(StartVirtualMachineTask(pve, false, cancellationToken));

        return tasks.ToArray();
    }
}

internal class CloneWorkspaceVirtualMachineOperation : CloneVirtualMachineOperation
{
    public required int Index;
    public required VirtualMachineDescriptor VirtualMachineDescriptor;
    public required VirtualNetworkDescriptor[] VirtualNetworkDescriptors;

    public override WorkspaceOperationTask[] GenerateTasks(IPVEClientService pve, IZeroTierService zeroTier, IMDCDatabaseService database, DatacenterEntry datacenterEntry, DbWorkspace dbWorkspace, CancellationToken cancellationToken)
    {
        List<WorkspaceOperationTask> tasks = new();

        if (VirtualMachineDescriptor.Name == null) throw new InvalidOperationException($"Virtual Machine Name is null for Virtual Machine Index '{Index}'");

        var virtualMachineName = MDCHelper.FormatVirtualMachineName(dbWorkspace.Address, MDCHelper.MDCResourceType.VirtualMachine, Index, VirtualMachineDescriptor.Name);
        tasks.Add(CloneVirtualMachineTask(pve, virtualMachineName, 3, cancellationToken));

        tasks.Add(new WorkspaceOperationTask
        {
            WorkspaceOperationTaskType = WorkspaceOperationTaskType.UpdateVirtualMachineConfiguration,
            ExecuteAsync = async () =>
            {
                if (vmid == null) throw new InvalidOperationException($"VMID is null for cloned VM '{VirtualMachineDescriptor.Name}' on node '{TargetNode}'");
                var qemuConfig = await pve.GetQemuConfigAsync(TargetNode, vmid.Value, cancellationToken) ?? throw new InvalidOperationException($"Unable to get Qemu Config for Workspace Address '{dbWorkspace.Address}' VM VMID '{vmid.Value}' on node '{TargetNode}'");

                // Remove all of the existing network devices and add new ones
                var networkAdapters = VirtualMachineDescriptor.NetworkAdapters!.Select(adapter => new PVEQemuConfigNetworkAdapter
                {
                    DeviceId = adapter.Name!,
                    DeviceIndex = Index,
                    Bridge = datacenterEntry.DatacenterSettings.LanBridgeName,
                    Tag = dbWorkspace.VirtualNetworks.FirstOrDefault(i => i.Name == adapter.RefVirtualNetworkName)?.Tag ?? throw new InvalidOperationException($"Virtual Network Name '{adapter.RefVirtualNetworkName}' does not exist in Workspace {dbWorkspace.Address}"),
                    IsFirewallEnabled = true,
                    IsDisconnected = false,
                    Model = "virtio"
                })
                .ToArray();
                var existingNetworkAdapters = qemuConfig.ParseNetworkAdapters();
                var deleteProperties = existingNetworkAdapters.Select(i => i.DeviceId).Except(networkAdapters.Select(i => i.DeviceId));
                var upid = await pve.UpdateQemuConfigAsync(TargetNode, vmid.Value, null, networkAdapters, deleteProperties, cancellationToken);
                await pve.WaitForTaskAsync(TargetNode, upid, cancellationToken);
            }
        });

        // For each of the remote networks, if enabled, we need to add the VM to the ZeroTier network
        bool waitForIPAddress = false;
        foreach (var networkAdapter in VirtualMachineDescriptor.NetworkAdapters!.Where(i => i.EnableRemoteNetwork == true))
        {
            waitForIPAddress = true;

            tasks.Add(new WorkspaceOperationTask
            {
                WorkspaceOperationTaskType = WorkspaceOperationTaskType.JoinZeroTierNetwork,
                ExecuteAsync = async () =>
                {
                    if (vmid == null) throw new InvalidOperationException($"VMID is null for cloned VM '{virtualMachineName}' on node '{TargetNode}'");
                    var dbVirtualNetwork = dbWorkspace.VirtualNetworks.FirstOrDefault(i => i.Name == VirtualMachineDescriptor.Name) ?? throw new InvalidOperationException($"Virtual Network Name '{VirtualMachineDescriptor.Name}' does not exist in Workspace {dbWorkspace.Address}");

                    if (dbVirtualNetwork.ZeroTierNetworkId == null)
                        throw new InvalidOperationException($"ZeroTier Network has not been created for Virtual Network '{dbVirtualNetwork.Name}' in Workspace {dbWorkspace.Address}");

                    // Install ZeroTier on the Bastion VM 
                    var installZeroTierResponse = await zeroTier.InstallZeroTierAsync(datacenterEntry.Site, TargetNode, vmid.Value, cancellationToken);

                    // Join to the ZeroTier Network
                    IPAddress[] ipAddresses = string.IsNullOrEmpty(networkAdapter.RemoteNetworkIPAddress) ? [] : [IPAddress.Parse(networkAdapter.RemoteNetworkIPAddress)];
                    var networkMembership = await zeroTier.JoinNetworkAsync(datacenterEntry.Site, TargetNode, vmid.Value, dbVirtualNetwork.ZeroTierNetworkId, "Bastion", ipAddresses, datacenterEntry.DatacenterSettings, cancellationToken);
                }
            });
        }

        tasks.Add(StartVirtualMachineTask(pve, waitForIPAddress, cancellationToken));

        return tasks.ToArray();
    }
}

internal class RemoveVirtualMachineOperation : WorkspaceOperation
{
    public required PVEResource PVEResource;

    public override WorkspaceOperationTask[] GenerateTasks(IPVEClientService pve, IZeroTierService zeroTier, IMDCDatabaseService database, DatacenterEntry datacenterEntry, DbWorkspace dbWorkspace, CancellationToken cancellationToken)
    {
        List<WorkspaceOperationTask> tasks = new();

        tasks.Add(new WorkspaceOperationTask
        {
            WorkspaceOperationTaskType = WorkspaceOperationTaskType.RemoveVirtualMachine,
            ExecuteAsync = async () =>
            {
                if (PVEResource.Node == null) throw new InvalidOperationException($"Node is null for VM on node '{PVEResource.Id}'");
                if (PVEResource.VmId == null) throw new InvalidOperationException($"VMID is null for VM on node '{PVEResource.Node}'");

                var upidStop = await pve.QemuStatusStopAsync(PVEResource.Node, PVEResource.VmId.Value, true, cancellationToken);
                await pve.WaitForTaskAsync(PVEResource.Node, upidStop, cancellationToken);

                var upidDelete = await pve.DeleteQemuAsync(PVEResource.Node, PVEResource.VmId.Value, true, true, cancellationToken);
                await pve.WaitForTaskAsync(PVEResource.Node, upidDelete, cancellationToken);
            }
        });

        return tasks.ToArray();
    }
}

internal class AddRemoteNetworkOperation : WorkspaceOperation
{
    public required VirtualNetworkDescriptor VirtualNetworkDescriptor;

    public override WorkspaceOperationTask[] GenerateTasks(IPVEClientService pve, IZeroTierService zeroTier, IMDCDatabaseService database, DatacenterEntry datacenterEntry, DbWorkspace dbWorkspace, CancellationToken cancellationToken)
    {
        List<WorkspaceOperationTask> tasks = new();

        // Create the ZeroTier Network
        tasks.Add(new WorkspaceOperationTask
        {
            WorkspaceOperationTaskType = WorkspaceOperationTaskType.CreateZeroTierNetwork,
            ExecuteAsync = async () =>
            {
                var dbVirtualNetwork = dbWorkspace.VirtualNetworks.FirstOrDefault(i => i.Name == VirtualNetworkDescriptor.Name) ?? throw new InvalidOperationException($"Virtual Network Name '{VirtualNetworkDescriptor.Name}' does not exist in Workspace {dbWorkspace.Address}");
                var networkName = MDCHelper.FormatZeroTierNetworkName(datacenterEntry.DbDatacenter.Name, dbWorkspace.Address, dbVirtualNetwork.Index);

                var createdNetwork = await zeroTier.CreateNetworkAsync(networkName, VirtualNetworkDescriptor, datacenterEntry.DatacenterSettings, cancellationToken);
                dbVirtualNetwork.ZeroTierNetworkId = createdNetwork.Id;
                await database.UpdateVirtualNetworkAsync(dbVirtualNetwork, cancellationToken);
            }
        });

        return tasks.ToArray();
    }
}

internal class UpdateRemoteNetworkOperation : WorkspaceOperation
{
    public required VirtualNetworkDescriptor VirtualNetworkDescriptor;
    public required string ZeroTierNetworkId;

    public override WorkspaceOperationTask[] GenerateTasks(IPVEClientService pve, IZeroTierService zeroTier, IMDCDatabaseService database, DatacenterEntry datacenterEntry, DbWorkspace dbWorkspace, CancellationToken cancellationToken)
    {
        // No tasks to perform on the PVE side for adding a remote network
        return Array.Empty<WorkspaceOperationTask>();
    }
}

internal class RemoveRemoteNetworkOperation : WorkspaceOperation
{
    public required VirtualNetworkDescriptor VirtualNetworkDescriptor;
    public required string ZeroTierNetworkId;

    public override WorkspaceOperationTask[] GenerateTasks(IPVEClientService pve, IZeroTierService zeroTier, IMDCDatabaseService database, DatacenterEntry datacenterEntry, DbWorkspace dbWorkspace, CancellationToken cancellationToken)
    {
        // No tasks to perform on the PVE side for adding a remote network
        return Array.Empty<WorkspaceOperationTask>();
    }
}

internal enum WorkspaceOperationTaskType
{
    CloneVirtualMachine,    // Must be done synchronously, as we need the VMID for subsequent tasks
    UpdateVirtualMachineConfiguration,
    StartVirtualMachine,
    RemoveVirtualMachine,
    CreateZeroTierNetwork,
    RemoveZeroTierNetwork,  // TODO
    JoinZeroTierNetwork,
    LeaveZeroTierNetwork    // TODO
}

internal class WorkspaceOperationTask
{
    public required WorkspaceOperationTaskType WorkspaceOperationTaskType;
    public int Order = 0;
    public required Func<Task> ExecuteAsync;
}
