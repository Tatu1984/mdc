namespace MDC.Core.Services.Providers.PVEClient;

internal enum QemuWaitOptions
{
    None = 0,
    WaitForTask = 1,
    WaitForState = 2,
    WaitForAgent = 3,
    WaitForIPAddress = 4
}

internal interface IPVEClientService
{
    Task<IEnumerable<PVEClusterStatus>> GetClusterStatusAsync(CancellationToken cancellationToken = default);

    Task<PVENodeStatus> GetNodeStatusAsync(string node, CancellationToken cancellationToken = default);

    Task<IEnumerable<PVEResource>> GetClusterResourcesAsync(CancellationToken cancellationToken = default);

    Task<PVEQemuConfig?> GetQemuConfigAsync(string node, int vmId, CancellationToken cancellationToken = default);

    Task<string> UpdateQemuConfigAsync(string node, int vmid, PVEQemuConfig? config, IEnumerable<PVEQemuConfigNetworkAdapter> networkAdapters, IEnumerable<string> deleteProperties, CancellationToken cancellationToken = default);

    Task<(int vmid, string upid)> CreateQemuCloneAsync(string templateNode, int templateVmId, string name, string targetNode, CancellationToken cancellationToken = default);

    Task<string> DeleteQemuAsync(string node, int vmId, bool? purgeFromJobConfigurations = false, bool? destroyUnreferencedDisks = false, CancellationToken cancellationToken = default);

    Task<(string upid, PVEQemuStatus? qemuStatus, PVEQemuAgentNetworkInterface[]? networkInterfaces)> QemuStatusStartAsync(string node, int vmid, QemuWaitOptions waitOption, CancellationToken cancellationToken = default);

    Task<string> QemuStatusStopAsync(string node, int vmid, bool? overruleShutdown, CancellationToken cancellationToken = default);

    Task<PVEClusterOptions> GetClusterOptionsAsync(CancellationToken cancellationToken = default);

    Task<PVEQemuStatus> GetQemuStatusCurrentAsync(string node, int vmid, CancellationToken cancellationToken = default);

    Task<bool> QemuAgentPingAsync(string node, int vmid, CancellationToken cancellationToken = default);

    Task<PVEQemuAgentNetworkInterface[]?> QemuAgentGetNetworkInterfacesAsync(string node, int vmid, CancellationToken cancellationToken = default);

    Task<string> QemuAgentExecAsync(string node, int vmid, string command, CancellationToken cancellationToken = default);

    Task<PVETaskStatus> WaitForTaskAsync(string node, string upid, CancellationToken cancellationToken = default);

    Task<PVEQemuStatus> QemuStatusWaitForStateAsync(string node, int vmid, string state, CancellationToken cancellationToken = default);

    Task<DatacenterSettings> GetDatacenterSettingsAsync(CancellationToken cancellationToken = default);
}
