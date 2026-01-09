using MDC.Core.Models;
using MDC.Core.Services.Providers.MDCDatabase;
using MDC.Core.Services.Providers.PVEClient;
using MDC.Core.Services.Providers.ZeroTier;
using System.Text.Json.Nodes;

namespace MDC.Core.Services.Api;

internal class WorkspaceService(IMDCDatabaseService databaseService, IPVEClientFactory pveClientFactory, IZeroTierService zeroTier) : IWorkspaceService
{
    public async Task<Workspace> CreateAsync(string site, WorkspaceDescriptor workspaceDescriptor, CancellationToken cancellationToken = default)
    {
        var pveClient = await pveClientFactory.CreateClientAsync(site, cancellationToken);
        var datacenterEntry = await DatacenterFactory.GetDatacenterEntryAsync(site, pveClient, databaseService, false, cancellationToken);

        List<Func<Task>> actions = new();

        // 1. Validate the Workspace creation parameters
        actions.Add(async () => await Task.Run(workspaceDescriptor.Validate));

        // 2. Compute request against available capacity
        WorkspaceOperation[] workspaceOperations = [];
        actions.Add(async () => await Task.Run(() => workspaceOperations = datacenterEntry.ComputeWorkspaceOperations(workspaceDescriptor)));
        
        // 3. [Database] Create Database rows for Workspace and Virtual Network VLANs to reserve the Workspace resources
        DbWorkspace? dbWorkspace = null;
        actions.Add(async () => dbWorkspace = await databaseService.CreateWorkspaceAsync(datacenterEntry, workspaceDescriptor.Name, workspaceDescriptor.VirtualNetworks!.Select(i => i.Name!).ToArray(), cancellationToken));

        // 4. [PVE] Create Virtual Machines
        actions.Add(async () => await ApplyWorkspaceOperationsAsync(pveClient, workspaceOperations, dbWorkspace!, datacenterEntry, cancellationToken));

    
        // Execute all of the actions
        foreach (var action in actions)
        {
            await action();
        }

        return await GetByIdAsync(site, dbWorkspace!.Id, cancellationToken) ?? throw new InvalidOperationException($"Unable to retrieve Workspace Address '{dbWorkspace.Address}' after creation.");
    }

    public async Task DeleteAsync(string site, Guid id, CancellationToken cancellationToken = default)
    {
        var pveClient = await pveClientFactory.CreateClientAsync(site, cancellationToken);
        var datacenterEntry = await DatacenterFactory.GetDatacenterEntryByWorkspaceIdAsync(site, pveClient, databaseService, id, false, cancellationToken);
        var workspace = datacenterEntry.Workspaces.Single();

        // Stop the VMs
        foreach (var re in workspace.ResourceEntries.Where(i => i.PVEResource != null))
        {
            var upid = await pveClient.QemuStatusStopAsync(re.PVEResource!.Node!, re.PVEResource!.VmId!.Value, true, cancellationToken);
            await pveClient.WaitForTaskAsync(re.PVEResource!.Node!, upid, cancellationToken);
        }

        // Remove the VMs
        foreach (var re in workspace.ResourceEntries.Where(i => i.PVEResource != null))
        {
            var upid = await pveClient.DeleteQemuAsync(re.PVEResource!.Node!, re.PVEResource!.VmId!.Value, true, true, cancellationToken);
            await pveClient.WaitForTaskAsync(re.PVEResource!.Node!, upid, cancellationToken);
        }

        // Remove the ZeroTier Network from the Controller
        foreach (var virtualNetwork in workspace.VirtualNetworks)
        {
            if (virtualNetwork.DbVirtualNetwork?.ZeroTierNetworkId == null)
            {
                continue;
            }
            await zeroTier.DeleteNetworkAsync(virtualNetwork.DbVirtualNetwork.ZeroTierNetworkId, cancellationToken);
        }

        // Delete the Database row
        var rows = await databaseService.DeleteWorkspaceAsync(workspace.DbWorkspace!, cancellationToken);
    }

    public async Task<IEnumerable<Workspace>> GetAllAsync(string site, CancellationToken cancellationToken = default)
    {
        var pveClient = await pveClientFactory.CreateClientAsync(site, cancellationToken);
        var datacenterEntry = await DatacenterFactory.GetDatacenterEntryAsync(site, pveClient, databaseService, false, cancellationToken);

        return DatacenterFactory.ToWorkspaces(datacenterEntry.Workspaces);
    }

    public async Task<Workspace?> GetByIdAsync(string site, Guid workspaceId, CancellationToken cancellationToken = default)
    {
        var pveClient = await pveClientFactory.CreateClientAsync(site, cancellationToken);
        var datacenterEntry = await DatacenterFactory.GetDatacenterEntryByWorkspaceIdAsync(site, pveClient, databaseService, workspaceId, false, cancellationToken);

        var workspaceEntry = datacenterEntry.Workspaces.FirstOrDefault(w => w.DbWorkspace!.Id == workspaceId);
        if (workspaceEntry == null)
        {
            return null;
        }

        // Populate the latest status information
        foreach (var re in workspaceEntry.ResourceEntries.Where(i => i.PVEResource != null && i.PVEResource.VmId != null))
        {
            re.PVEQemuStatus = await pveClient.GetQemuStatusCurrentAsync(re.PVEResource!.Node!, re.PVEResource!.VmId!.Value, cancellationToken);
            re.PVEQemuConfig = await pveClient.GetQemuConfigAsync(re.PVEResource!.Node!, re.PVEResource!.VmId!.Value, cancellationToken);
        }

        if (workspaceEntry.Bastion != null)
        {
            if (workspaceEntry.VirtualNetworks.Any(i => i.DbVirtualNetwork?.ZeroTierNetworkId != null)) // If any of the Virtual Networks has a Remote Network (ZeroTier) then get the ZeroTier Config
            {
                workspaceEntry.Bastion.ZTNodeConfig = await zeroTier.GetNodeStatusAsync(site, workspaceEntry.Bastion.PVEResource!.Node!, workspaceEntry.Bastion.PVEResource!.VmId!.Value, cancellationToken);
                workspaceEntry.Bastion.ZTNetworkMembership = await zeroTier.GetNetworkMembershipAsync(site, workspaceEntry.Bastion.PVEResource!.Node!, workspaceEntry.Bastion.PVEResource!.VmId!.Value, workspaceEntry.VirtualNetworks.Single().DbVirtualNetwork!.ZeroTierNetworkId!, cancellationToken);
            }
            workspaceEntry.Bastion.PVEQemuAgentNetworkInterfaces = await pveClient.QemuAgentGetNetworkInterfacesAsync(workspaceEntry.Bastion.PVEResource!.Node!, workspaceEntry.Bastion.PVEResource!.VmId!.Value, cancellationToken);
        }

        var result = DatacenterFactory.ToWorkspaces([workspaceEntry]).Single();

        if (result.Bastion == null)
        {
            throw new InvalidOperationException($"Workspace Address '{result.Address}' is missing the Bastion resource.");
        }
        return result;
    }

    public Task<Workspace?> GetByAddressAsync(string site, int address, CancellationToken cancellationToken = default)
    {
        throw new NotImplementedException();
        // return Task.FromResult(_workspaces.FirstOrDefault(w => w.Address == address));
    }

    public async Task<Workspace> UpdateAsync(string site, Guid workspaceId,JsonNode delta, CancellationToken cancellationToken = default)
    {
        var pveClient = await pveClientFactory.CreateClientAsync(site, cancellationToken);
        var datacenterEntry = await DatacenterFactory.GetDatacenterEntryByWorkspaceIdAsync(site, pveClient, databaseService, workspaceId, true, cancellationToken);

        var workspaceEntry = datacenterEntry.Workspaces.Single(w => w.DbWorkspace!.Id == workspaceId);
        if (workspaceEntry.WorkspaceDescriptor == null)
            throw new InvalidOperationException($"Workspace Descriptor is not available for Workspace Id '{workspaceId}'");

        var workspaceDescriptor = MDCHelper.Patch(workspaceEntry.WorkspaceDescriptor, delta);

        List<Func<Task>> actions = new();

        // 1. Validate the Workspace creation parameters
        actions.Add(async () => await Task.Run(workspaceDescriptor.Validate));

        // 2. Compute request against available capacity
        WorkspaceOperation[] workspaceOperations = [];
        actions.Add(async () => await Task.Run(() => workspaceOperations = datacenterEntry.ComputeWorkspaceOperations(workspaceDescriptor, workspaceEntry)));

        // 3. [Database] Update Database rows for Workspace and Virtual Network VLANs to reserve the Workspace resources
        DbWorkspace? dbWorkspace = null;
        actions.Add(async () => dbWorkspace = await databaseService.UpdateWorkspaceAsync(datacenterEntry, workspaceId, workspaceDescriptor, cancellationToken));

        // 4. [PVE] Create Virtual Machines
        actions.Add(async () => await ApplyWorkspaceOperationsAsync(pveClient, workspaceOperations, dbWorkspace!, datacenterEntry, cancellationToken));

        // Execute all of the actions
        foreach (var action in actions)
        {
            await action();
        }

        return await GetByIdAsync(site, workspaceId, cancellationToken) ?? throw new InvalidOperationException($"Unable to retrieve Workspace Address '{workspaceEntry.Address}' after update.");
    }

    #region Private Methods

    private async Task ApplyWorkspaceOperationsAsync(IPVEClientService pveClient, WorkspaceOperation[] workspaceOperations, DbWorkspace dbWorkspace, DatacenterEntry datacenterEntry, CancellationToken cancellationToken = default)
    {
        List<WorkspaceOperationTask> workspaceOperationTasks = new List<WorkspaceOperationTask>();

        foreach (var operation in workspaceOperations)
        {
            workspaceOperationTasks.AddRange(operation.GenerateTasks(pveClient, zeroTier, databaseService, datacenterEntry, dbWorkspace, cancellationToken));
        }

        // Stop all of the VMs that are going to be modified or deleted
        await Task.WhenAll(
            workspaceOperationTasks.Where(t => t.WorkspaceOperationTaskType == WorkspaceOperationTaskType.RemoveVirtualMachine).OrderBy(i => i.Order)
            .Select(entry => entry.ExecuteAsync()));

        // Clone VM Must be done synchronously to avoid VMID conflicts
        foreach (var task in workspaceOperationTasks.Where(t => t.WorkspaceOperationTaskType == WorkspaceOperationTaskType.CloneVirtualMachine).OrderBy(i => i.Order))
        {
            await task.ExecuteAsync();
        }

        // Update the VM Configurations
        await Task.WhenAll(
            workspaceOperationTasks.Where(t => t.WorkspaceOperationTaskType == WorkspaceOperationTaskType.UpdateVirtualMachineConfiguration).OrderBy(i => i.Order)
            .Select(entry => entry.ExecuteAsync()));

        // Create any ZeroTier Networks
        await Task.WhenAll(
            workspaceOperationTasks.Where(t => t.WorkspaceOperationTaskType == WorkspaceOperationTaskType.CreateZeroTierNetwork).OrderBy(i => i.Order)
            .Select(entry => entry.ExecuteAsync()));

        // Start the VMs
        await Task.WhenAll(
            workspaceOperationTasks.Where(t => t.WorkspaceOperationTaskType == WorkspaceOperationTaskType.StartVirtualMachine).OrderBy(i => i.Order)
            .Select(entry => entry.ExecuteAsync()));

        // Join ZeroTier Networks
        await Task.WhenAll(
            workspaceOperationTasks.Where(t => t.WorkspaceOperationTaskType == WorkspaceOperationTaskType.JoinZeroTierNetwork).OrderBy(i => i.Order)
            .Select(entry => entry.ExecuteAsync()));
    }

    #endregion
}
