using System.Diagnostics;
using System.Net;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;

namespace MDC.Core.Services.Providers.PVEClient;

internal class PVEClientService(HttpClient httpClient) : IPVEClientService
{
    /// <inheritdoc />
    public async Task<IEnumerable<PVEClusterStatus>> GetClusterStatusAsync(CancellationToken cancellationToken = default)
    {
        var response = await httpClient.GetAsync("cluster/status", cancellationToken);
        var responseMessage = response.EnsureSuccessStatusCode();
        return (await responseMessage.Content.ReadFromJsonAsync<PVEResponse<IEnumerable<PVEClusterStatus>>>(cancellationToken))?.Data ?? [];
    }

    public async Task<PVENodeStatus> GetNodeStatusAsync(string node, CancellationToken cancellationToken = default)
    {
        var response = await httpClient.GetAsync($"nodes/{node}/status", cancellationToken);
        var responseMessage = response.EnsureSuccessStatusCode();
        return (await responseMessage.Content.ReadFromJsonAsync<PVEResponse<PVENodeStatus>>(cancellationToken))?.Data ?? throw new InvalidOperationException($"Unable to get status for node '{node}'.");
    }

    public async Task<IEnumerable<PVEResource>> GetClusterResourcesAsync(CancellationToken cancellationToken = default)
    {
        var response = await httpClient.GetAsync("cluster/resources", cancellationToken);
        var responseMessage = response.EnsureSuccessStatusCode();
        return (await responseMessage.Content.ReadFromJsonAsync<PVEResponse<IEnumerable<PVEResource>>>(cancellationToken))?.Data ?? [];
    }

    public async Task<PVEQemuConfig?> GetQemuConfigAsync(string node, int vmId, CancellationToken cancellationToken = default)
    {
        var response = await httpClient.GetAsync($"nodes/{node}/qemu/{vmId}/config", cancellationToken);
        var responseMessage = response.EnsureSuccessStatusCode();
        return (await responseMessage.Content.ReadFromJsonAsync<PVEResponse<PVEQemuConfig>> (cancellationToken))?.Data;
    }

    public async Task<string> UpdateQemuConfigAsync(string node, int vmid, PVEQemuConfig? config, IEnumerable<PVEQemuConfigNetworkAdapter> networkAdapters, IEnumerable<string> deleteProperties, CancellationToken cancellationToken = default)
    {
        var values = new Dictionary<string, string>();      
        if (config?.Cores != null)
            values.Add("cores", config.Cores.Value.ToString());
        if (config?.Memory != null)
            values.Add("memory", config.Memory);
        
        foreach (var networkAdapter in networkAdapters)
            values.Add(networkAdapter.DeviceId, networkAdapter.ToConfigValue());
        if (deleteProperties != null && deleteProperties.Any())
            values.Add("delete", string.Join(",", deleteProperties));

        using var content = new FormUrlEncodedContent(values);

        using var response = await httpClient.PostAsync($"nodes/{node}/qemu/{vmid}/config", content, cancellationToken);
        try
        {
            using var responseMessage = response.EnsureSuccessStatusCode();
            var upid = (await responseMessage.Content.ReadFromJsonAsync<PVEResponse<string>>(cancellationToken))?.Data ?? throw new InvalidOperationException($"Unable to Update VM Config VMID '{vmid}' on Node '{node}'.");
            return upid;
        }
        catch (HttpRequestException ex) // when (ex.Message.Contains("500 (Internal Server Error)") && response.Content != null)
        {
            // Proxmox returns a 500 error if the configuration is invalid, so we need to parse the error message
            var errorMessage = await response.Content.ReadAsStringAsync(cancellationToken);
            throw new ApplicationException($"Unable to Update VM Config VMID '{vmid}' on Node '{node}': {errorMessage}", ex);
        }
    }

    private static readonly SemaphoreSlim _asyncLock_CreateQemuCloneAsync = new SemaphoreSlim(1, 1);
    public async Task<(int vmid, string upid)> CreateQemuCloneAsync(string templateNode, int templateVmId, string name, string targetNode, CancellationToken cancellationToken = default)
    {
        // lock this section so that multiple threads do not get the same "newid" from GetNextIdAsync
        await _asyncLock_CreateQemuCloneAsync.WaitAsync(cancellationToken);
        try
        {
            int newid = await GetNextIdAsync(cancellationToken);

            var values = new Dictionary<string, string>
            {
                { "newid", newid.ToString() },
                { "name", name },
                { "target", targetNode},
            };
            using var content = new FormUrlEncodedContent(values);

            using var response = await httpClient.PostAsync($"nodes/{templateNode}/qemu/{templateVmId}/clone", content, cancellationToken);

            using var responseMessage = response.EnsureSuccessStatusCode();
            var upid = (await responseMessage.Content.ReadFromJsonAsync<PVEResponse<string>>(cancellationToken))?.Data ?? throw new InvalidOperationException($"Unable to Clone VM Template VMID '{templateVmId}' from Node '{templateNode}' to VMID '{newid}' on node '{targetNode}' using VM Name '{name}'.");
            return (newid, upid);
        }
        finally
        {
            _asyncLock_CreateQemuCloneAsync.Release();
        }
    }

    public async Task<string> DeleteQemuAsync(string node, int vmId, bool? purgeFromJobConfigurations = false, bool? destroyUnreferencedDisks = false, CancellationToken cancellationToken = default)
    {
        List<string> parameters = new List<string>();
        if (purgeFromJobConfigurations == true) parameters.Add("purge=1");
        if (destroyUnreferencedDisks == true) parameters.Add("destroy-unreferenced-disks=1");

        var response = await httpClient.DeleteAsync($"nodes/{node}/qemu/{vmId}{(parameters.Count > 0 ? $"?{string.Join('&', parameters)}" : string.Empty)}", cancellationToken);

        var responseMessage = response.EnsureSuccessStatusCode();
        return (await responseMessage.Content.ReadFromJsonAsync<PVEResponse<string>>(cancellationToken))?.Data ?? throw new InvalidOperationException($"Unable to Delete VM VMID '{vmId}' from Node '{node}'.");
    }

    public async Task<(string upid, PVEQemuStatus? qemuStatus, PVEQemuAgentNetworkInterface[]? networkInterfaces)> QemuStatusStartAsync(string node, int vmid, QemuWaitOptions waitOption, CancellationToken cancellationToken = default)
    {
        var values = new Dictionary<string, string>();
        using var content = new FormUrlEncodedContent(values);

        using var response = await httpClient.PostAsync($"nodes/{node}/qemu/{vmid}/status/start", content, cancellationToken);
        using var responseMessage = response.EnsureSuccessStatusCode();
        var upid = (await responseMessage.Content.ReadFromJsonAsync<PVEResponse<string>>(cancellationToken))?.Data ?? throw new InvalidOperationException($"Unable to Start VM VMID '{vmid}' on Node '{node}'.");

        if (waitOption == QemuWaitOptions.None)
            return (upid, null, null);

        // Wait for Task to complete
        var taskStatus = await WaitForTaskAsync(node, upid, cancellationToken);
        if (taskStatus.ExitStatus != "OK") throw new ApplicationException($"Start Task '{upid}' failed with error '{taskStatus?.ExitStatus}'");

        if (waitOption == QemuWaitOptions.WaitForTask)
            return (upid, null, null);

        // Wait for VM to be in running state
        PVEQemuStatus currentStatus = await QemuStatusWaitForStateAsync(node, vmid, "running", cancellationToken);
        if (waitOption == QemuWaitOptions.WaitForState || currentStatus.Agent != 1)
            return (upid, currentStatus, null);

        // Wait for Agent to be available
        var ping = await QemuStatusWaitForAgentAsync(node, vmid, cancellationToken);
        if (waitOption == QemuWaitOptions.WaitForAgent)
        {
            return (upid, currentStatus, null);
        }

        // Wait for IP Address
        if (waitOption == QemuWaitOptions.WaitForIPAddress)
        {
            var networkInterfaces = await QemuStatusWaitForAgentIPAddressAsync(node, vmid, cancellationToken);
            return (upid, currentStatus, networkInterfaces);
        }
        throw new InvalidOperationException($"Invalid wait option '{waitOption}' specified.");
    }

    public async Task<string> QemuStatusStopAsync(string node, int vmid, bool? overruleShutdown, CancellationToken cancellationToken = default)
    {
        var values = new Dictionary<string, string>();
        if (overruleShutdown.HasValue)
            values.Add("overrule-shutdown", overruleShutdown.Value ? "0" : "1");
        using var content = new FormUrlEncodedContent(values);

        using var response = await httpClient.PostAsync($"nodes/{node}/qemu/{vmid}/status/stop", content, cancellationToken);
        using var responseMessage = response.EnsureSuccessStatusCode();
        var upid = (await responseMessage.Content.ReadFromJsonAsync<PVEResponse<string>>(cancellationToken))?.Data ?? throw new InvalidOperationException($"Unable to Start VM VMID '{vmid}' on Node '{node}'.");
        return upid;
    }

    public async Task<PVEClusterOptions> GetClusterOptionsAsync(CancellationToken cancellationToken = default)
    {
        var response = await httpClient.GetAsync("cluster/options", cancellationToken);
        var responseMessage = response.EnsureSuccessStatusCode();
        return (await responseMessage.Content.ReadFromJsonAsync<PVEResponse<PVEClusterOptions>>(cancellationToken))?.Data ?? throw new InvalidOperationException("Unable to get Cluster Options.");
    }

    public async Task<PVEQemuStatus> GetQemuStatusCurrentAsync(string node, int vmid, CancellationToken cancellationToken = default)
    {
        var response = await httpClient.GetAsync($"nodes/{node}/qemu/{vmid}/status/current", cancellationToken);
        var responseMessage = response.EnsureSuccessStatusCode();
        return (await responseMessage.Content.ReadFromJsonAsync<PVEResponse<PVEQemuStatus>>(cancellationToken))?.Data ?? throw new InvalidOperationException($"Unable to get current status for VMID '{vmid}' on node '{node}'.");
    }

    public async Task<bool> QemuAgentPingAsync(string node, int vmid, CancellationToken cancellationToken = default)
    {
        var response = await httpClient.PostAsync($"nodes/{node}/qemu/{vmid}/agent/ping", null, cancellationToken);
        if (response.StatusCode == System.Net.HttpStatusCode.InternalServerError && response.ReasonPhrase == "QEMU guest agent is not running")
        {
            // Agent is not available
            return false;
        }
        var responseMessage = response.EnsureSuccessStatusCode();
        var result = (await responseMessage.Content.ReadFromJsonAsync<PVEResponse<JsonNode>>(cancellationToken))?.Data ?? throw new InvalidOperationException($"Unable to ping QEMU agent for VMID '{vmid}' on node '{node}'.");
        return result["result"]?.AsObject().Count == 0; // .GetValue<string>() == "OK";
    }

    public async Task<PVEQemuAgentNetworkInterface[]?> QemuAgentGetNetworkInterfacesAsync(string node, int vmid, CancellationToken cancellationToken = default)
    {
        var response = await httpClient.GetAsync($"nodes/{node}/qemu/{vmid}/agent/network-get-interfaces", cancellationToken);
        if (response.StatusCode == HttpStatusCode.InternalServerError && response.ReasonPhrase == "QEMU guest agent is not running")
            return null;
        var responseMessage = response.EnsureSuccessStatusCode();
        var networkInterfaces = (await responseMessage.Content.ReadFromJsonAsync<PVEResponse<JsonNode>>(cancellationToken))?.Data ?? throw new InvalidOperationException($"Unable to get QEMU agent network interfaces for VMID '{vmid}' on node '{node}'.");

        return networkInterfaces["result"]?.AsArray().SelectMany(ni => ni?["ip-addresses"]?.AsArray() ?? [], (ni, ip) => new PVEQemuAgentNetworkInterface
            {
                Name = ni?["name"]?.GetValue<string>() ?? string.Empty,
                MACAddress = ni?["hardware-address"]?.GetValue<string>() ?? string.Empty,
                IPAddress = IPAddress.TryParse(ip?["ip-address"]?.GetValue<string>(), out var address) ? address : null,
                Prefix = ip?["prefix"]?.GetValue<int>()
            })
            .ToArray() ?? [];
    }

    public async Task<string> QemuAgentExecAsync(string node, int vmid, string command, CancellationToken cancellationToken = default)
    {
        var values = new Dictionary<string, string[]>
        {
            { "command", ["/bin/sh", "-c", command] }
        };
        using var content = new StringContent(JsonSerializer.Serialize(values), Encoding.UTF8, "application/json");
        using var response = await httpClient.PostAsync($"nodes/{node}/qemu/{vmid}/agent/exec", content, cancellationToken);
        using var responseMessage = response.EnsureSuccessStatusCode();
        var pid = (await responseMessage.Content.ReadFromJsonAsync<PVEResponse<JsonNode>>(cancellationToken))?.Data?["pid"]?.GetValue<int>() ?? throw new InvalidOperationException($"Unable to execute QEMU agent command '{command}' for VMID '{vmid}' on node '{node}'.");

        // Get the Exec Status
        var datacenterSettings = await GetDatacenterSettingsAsync(cancellationToken);
        var stopwatch = Stopwatch.StartNew();
        do
        {
            // await Task.Delay(500, cancellationToken); // Wait a bit before checking the status
            using var statusResponse = await httpClient.GetAsync($"nodes/{node}/qemu/{vmid}/agent/exec-status?pid={pid}", cancellationToken);
            using var statusResponseMessage = statusResponse.EnsureSuccessStatusCode();
            var execStatus = (await statusResponseMessage.Content.ReadFromJsonAsync<PVEResponse<JsonNode>>(cancellationToken))?.Data ?? throw new InvalidOperationException($"Unable to get exec status for QEMU agent command '{command}' with PID '{pid}' for VMID '{vmid}' on node '{node}'.");
            var exited = execStatus["exited"]?.GetValue<int>() == 1;
            if (exited)
            {
                var exitcode = execStatus["exitcode"]?.GetValue<int>() ?? -1;
                if (exitcode != 0)
                {
                    var error = execStatus["error"]?.GetValue<string>() ?? "Unknown error";
                    throw new ApplicationException($"QEMU agent command '{command}' for VMID '{vmid}' on node '{node}' failed with exit code {exitcode}: {error}");
                }
                return execStatus["out-data"]?.GetValue<string>() ?? string.Empty;
            }

            if (stopwatch.Elapsed.TotalSeconds > datacenterSettings.WaitForQemuAgentExecTimeoutSeconds)
                throw new TimeoutException($"Waiting for VMID '{vmid}' IP Address timed out after {datacenterSettings.WaitForQemuAgentExecTimeoutSeconds} seconds.");
            await Task.Delay(datacenterSettings.WaitForQemuAgentExecPollingDelayMilliseconds, cancellationToken);
        } while (true);
    }

    public async Task<PVETaskStatus> WaitForTaskAsync(string node, string upid, CancellationToken cancellationToken = default)
    {
        var datacenterSettings = await GetDatacenterSettingsAsync(cancellationToken);
        var stopwatch = Stopwatch.StartNew();
        do
        {
            try
            {
                var taskStatus = await GetTaskStatusAsync(node, upid, cancellationToken);

                if (taskStatus?.Status == PVETaskStatusType.Stopped)
                {
                    if (taskStatus?.ExitStatus != "OK") throw new ApplicationException($"Task '{upid}' failed with error '{taskStatus?.ExitStatus}'");
                    return taskStatus;
                }
            }
            catch (HttpRequestException ex) when (ex.StatusCode == HttpStatusCode.BadRequest && ex.Message == "Response status code does not indicate success: 400 (Parameter verification failed.).")
            {
                // Task not found, continue polling
            }

            if (stopwatch.Elapsed.TotalSeconds > datacenterSettings.WaitForTaskTimeoutSeconds)
                throw new TimeoutException($"Task '{upid}' timed out after {datacenterSettings.WaitForTaskTimeoutSeconds} seconds.");

            await Task.Delay(datacenterSettings.WaitForTaskPollingDelayMilliseconds, cancellationToken);
        } while (true);
    }

    public async Task<PVEQemuStatus> QemuStatusWaitForStateAsync(string node, int vmid, string state, CancellationToken cancellationToken = default)
    {
        // Supported states are: "shutdown", "running", "paused", "suspended", "stopped".   See https://qemu.weilnetz.de/doc/2.11/qemu-qmp-ref.pdf section 1.5 VM run state
        var datacenterSettings = await GetDatacenterSettingsAsync(cancellationToken);
        var stopwatch = Stopwatch.StartNew();
        do
        {
            var currentStatus = await GetQemuStatusCurrentAsync(node, vmid, cancellationToken);
            if (currentStatus.Qmpstatus == state)
                return currentStatus;
            if (stopwatch.Elapsed.TotalSeconds > datacenterSettings.WaitForQemuStatusTimeoutSeconds)
                throw new TimeoutException($"Waiting for VMID '{vmid}' to reach '{state}' state timed out after {datacenterSettings.WaitForQemuStatusTimeoutSeconds} seconds.");
            await Task.Delay(datacenterSettings.WaitForQemuStatusPollingDelayMilliseconds, cancellationToken);
        } while (true);
    }

    #region Private Members
    private async Task<int> GetNextIdAsync(CancellationToken cancellationToken = default)
    {
        var response = await httpClient.GetAsync($"cluster/nextid", cancellationToken);
        var responseMessage = response.EnsureSuccessStatusCode();
        return (await responseMessage.Content.ReadFromJsonAsync<PVEResponse<int>>(cancellationToken))?.Data ?? throw new InvalidOperationException("Unable to get next free VMID.");
    }

    private async Task<PVETaskStatus> GetTaskStatusAsync(string node, string upid, CancellationToken cancellationToken = default)
    {
        var response = await httpClient.GetAsync($"nodes/{node}/tasks/{upid}/status", cancellationToken);
        var responseMessage = response.EnsureSuccessStatusCode();
        return (await responseMessage.Content.ReadFromJsonAsync<PVEResponse<PVETaskStatus>>(cancellationToken))?.Data ?? throw new InvalidOperationException($"Unable to get status for task '{upid}'."); ;
    }

    private async Task<bool> QemuStatusWaitForAgentAsync(string node, int vmid, CancellationToken cancellationToken = default)
    {
        var datacenterSettings = await GetDatacenterSettingsAsync(cancellationToken);
        var stopwatch = Stopwatch.StartNew();
        do
        {
            var pingResult = await QemuAgentPingAsync(node, vmid, cancellationToken);
            if (pingResult)
            {
                return true;
            }
            if (stopwatch.Elapsed.TotalSeconds > datacenterSettings.WaitForQemuAgentTimeoutSeconds)
                throw new TimeoutException($"Waiting for VMID '{vmid}' agent timed out after {datacenterSettings.WaitForQemuAgentTimeoutSeconds} seconds.");
            await Task.Delay(datacenterSettings.WaitForQemuAgentPollingDelayMilliseconds, cancellationToken);
        } while (true);
    }

    private async Task<PVEQemuAgentNetworkInterface[]> QemuStatusWaitForAgentIPAddressAsync(string node, int vmid, CancellationToken cancellationToken = default)
    {
        var datacenterSettings = await GetDatacenterSettingsAsync(cancellationToken);
        var stopwatch = Stopwatch.StartNew();
        do
        {
            var networkInterfaces = await QemuAgentGetNetworkInterfacesAsync(node, vmid, cancellationToken);
            if (networkInterfaces != null && networkInterfaces.Any(ni => ni.IPAddress != null && ni.IPAddress.AddressFamily == System.Net.Sockets.AddressFamily.InterNetwork && !IPAddress.IsLoopback(ni.IPAddress)))
            {
                return networkInterfaces;
            }

            if (stopwatch.Elapsed.TotalSeconds > datacenterSettings.WaitForQemuAgentIPAddressTimeoutSeconds)
                throw new TimeoutException($"Waiting for VMID '{vmid}' IP Address timed out after {datacenterSettings.WaitForQemuAgentIPAddressTimeoutSeconds} seconds.");
            await Task.Delay(datacenterSettings.WaitForQemuAgentIPAddressPollingDelayMilliseconds, cancellationToken);
        } while (true);
    }

    public async Task<DatacenterSettings> GetDatacenterSettingsAsync(CancellationToken cancellationToken = default)
    {
        var clusterOptions = await GetClusterOptionsAsync(cancellationToken);

        DatacenterSettings? datacenterSettings = null;
        if (!string.IsNullOrWhiteSpace(clusterOptions.Description))
        {
            try
            {
                datacenterSettings = JsonSerializer.Deserialize<DatacenterSettings>(clusterOptions.Description, System.Text.Json.JsonSerializerOptions.Web);
            }
            catch (JsonException ex)
            {
                throw new ApplicationException("Unable to deserialize Datacenter Settings from Cluster Options Description.", ex);
            }
        }
        return datacenterSettings ?? new DatacenterSettings();
    }
    #endregion
}
