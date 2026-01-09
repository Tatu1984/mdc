using MDC.Core.Services.Providers.PVEClient;
using Microsoft.Extensions.Options;
using System;
using System.Diagnostics;
using System.Net;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;

namespace MDC.Core.Services.Providers.ZeroTier;

internal class ZeroTierService(HttpClient httpClient, IOptions<ZeroTierServiceOptions> options, IServiceProvider serviceCollection) : IZeroTierService
{
    public async Task<ZTStatus> GetStatusAsync(CancellationToken cancellationToken = default)
    {
        var response = await httpClient.GetAsync("controller/status", cancellationToken);
        var responseMessage = response.EnsureSuccessStatusCode();
        return (await responseMessage.Content.ReadFromJsonAsync<ZTStatus>(cancellationToken)) ?? throw new InvalidOperationException($"Unable to get ZeroTier status.");
    }

    //public async Task<ZTControllerStatus> GetControllerStatusAsync(CancellationToken cancellationToken = default)
    //{
    //    var response = await httpClient.GetAsync("controller/status", cancellationToken);
    //    var responseMessage = response.EnsureSuccessStatusCode();
    //    return (await responseMessage.Content.ReadFromJsonAsync<ZTControllerStatus>(cancellationToken)) ?? throw new InvalidOperationException($"Unable to get ZeroTier Controller status.");
    //}

    public async Task<ZTNetwork[]> GetNetworksAsync(CancellationToken cancellationToken = default)
    {
        var response = await httpClient.GetAsync("api/network", cancellationToken);
        var responseMessage = response.EnsureSuccessStatusCode();
        return (await responseMessage.Content.ReadFromJsonAsync<ZTNetwork[]>(cancellationToken)) ?? throw new InvalidOperationException($"Unable to get ZeroTier Controller Networks.");
    }

    public async Task<ZTNetwork> GetNetworkByIdAsync(string networkId, CancellationToken cancellationToken = default)
    {
        var response = await httpClient.GetAsync($"api/network/{networkId}", cancellationToken);
        var responseMessage = response.EnsureSuccessStatusCode();
        return (await responseMessage.Content.ReadFromJsonAsync<ZTNetwork>(cancellationToken)) ?? throw new InvalidOperationException($"Unable to get details of ZeroTier Controller Network {networkId}.");
    }

    public async Task<ZTMember[]> GetNetworkMembersAsync(string networkId, CancellationToken cancellationToken = default)
    {
        var response = await httpClient.GetAsync($"api/network/{networkId}/member", cancellationToken);
        var responseMessage = response.EnsureSuccessStatusCode();
        return (await responseMessage.Content.ReadFromJsonAsync<ZTMember[]>(cancellationToken)) ?? throw new InvalidOperationException($"Unable to get Members of ZeroTier Controller Network {networkId}.");
    }

    public async Task<ZTMember> GetNetworkMemberByIdAsync(string networkId, string memberId, CancellationToken cancellationToken = default)
    {
        var response = await httpClient.GetAsync($"api/network/{networkId}/member/{memberId}", cancellationToken);
        var responseMessage = response.EnsureSuccessStatusCode();
        return (await responseMessage.Content.ReadFromJsonAsync<ZTMember>(cancellationToken)) ?? throw new InvalidOperationException($"Unable to get details of ZeroTier Controller Network {networkId} member {memberId}.");
    }

    public async Task DeleteNetworkAsync(string networkId, CancellationToken cancellationToken = default)
    {
        var response = await httpClient.DeleteAsync($"api/network/{networkId}", cancellationToken);
        response.EnsureSuccessStatusCode();
    }

    public async Task<ZTNetwork> CreateNetworkAsync(string networkName, VirtualNetworkDescriptor virtualNetworkDescriptor, DatacenterSettings datacenterSettings, CancellationToken cancellationToken = default)
    {
        var networkDefinition = new JsonObject
        {
            ["config"] = new JsonObject
            {
                ["name"] = networkName,
                ["private"] = true,
                ["ipAssignmentPools"] = new JsonArray
                {
                    new JsonObject
                    {
                        ["ipRangeStart"] = virtualNetworkDescriptor.RemoteNetworkIPRangeStart ?? datacenterSettings.DefaultRemoteNetworkIPRangeStart,
                        ["ipRangeEnd"] = virtualNetworkDescriptor.RemoteNetworkIPRangeEnd ?? datacenterSettings.DefaultRemoteNetworkIPRangeStart
                    }
                },
                ["routes"] = new JsonArray
                {
                    new JsonObject
                    {
                        ["target"] = virtualNetworkDescriptor.RemoteNetworkAddressCIDR ??  datacenterSettings.DefaultRemoteNetworkAddressCIDR,
                        ["via"] = null
                    }
                },
                ["v4AssignMode"] = new JsonObject
                {
                    ["zt"] = true
                },
                ["enableBroadcast"] = true
            }
        };

        var response = await httpClient.PostAsJsonAsync("api/network", networkDefinition, cancellationToken);
        var responseMessage = response.EnsureSuccessStatusCode();
        return (await responseMessage.Content.ReadFromJsonAsync<ZTNetwork>(cancellationToken)) ?? throw new InvalidOperationException($"Unable to create ZeroTier Network.");
    }

    public async Task<ZTMember> SetNetworkMemberAuthorizationAsync(string networkId, string memberId, bool authorized, CancellationToken cancellationToken = default)
    {
        var content = new JsonObject
        {
            ["authorized"] = authorized
        };
        var response = await httpClient.PostAsJsonAsync($"api/network/{networkId}/member/{memberId}", content, cancellationToken);
        var responseMessage = response.EnsureSuccessStatusCode();
        return (await responseMessage.Content.ReadFromJsonAsync<ZTMember>(cancellationToken)) ?? throw new InvalidOperationException($"Unable to set authorization of ZeroTier Controller Network {networkId} member {memberId}.");
    }

    public async Task<ZTMember> SetNetworkMemberNameAsync(string networkId, string memberId, string name, CancellationToken cancellationToken = default)
    {
        var content = new JsonObject
        {
            ["name"] = name
        };
        var response = await httpClient.PostAsJsonAsync($"api/network/{networkId}/member/{memberId}", content, cancellationToken);
        var responseMessage = response.EnsureSuccessStatusCode();
        return (await responseMessage.Content.ReadFromJsonAsync<ZTMember>(cancellationToken)) ?? throw new InvalidOperationException($"Unable to set authorization of ZeroTier Controller Network {networkId} member {memberId}.");
    }

    public async Task<ZTMember> SetNetworkMemberIpAssignmentsAsync(string networkId, string memberId, IPAddress[] iPAddresses, CancellationToken cancellationToken = default)
    {
        var value = string.Join(",", iPAddresses.Select(x => x.ToString()));
        var content = new JsonObject
        {
            ["ipAssignments"] = new JsonArray(iPAddresses.Select(x => JsonValue.Create(x.ToString())).ToArray())
        };
        var response = await httpClient.PostAsJsonAsync($"api/network/{networkId}/member/{memberId}", content, cancellationToken);
        var responseMessage = response.EnsureSuccessStatusCode();
        return (await responseMessage.Content.ReadFromJsonAsync<ZTMember>(cancellationToken)) ?? throw new InvalidOperationException($"Unable to set IP Address Assginment of ZeroTier Controller Network {networkId} member {memberId} with values '{string.Join(",", value)}'.");
    }

    public async Task DeleteNetworkMemberAsync(string networkId, string memberId, CancellationToken cancellationToken = default)
    {
        var response = await httpClient.DeleteAsync($"api/network/{networkId}/member/{memberId}", cancellationToken);
        response.EnsureSuccessStatusCode();
    }

    public async Task<ZTNodeConfig> GetNodeStatusAsync(string site, string node, int vmid, CancellationToken cancellationToken = default)
    {
        var pveClientFactory = serviceCollection.GetRequiredService<IPVEClientFactory>();
        var pveClient = await pveClientFactory.CreateClientAsync(site, cancellationToken);
        var result = await pveClient.QemuAgentExecAsync(node, vmid, $"zerotier-cli info -j");

        // Return the result as a ZTStatus object
        return JsonSerializer.Deserialize<ZTNodeConfig>(result, System.Text.Json.JsonSerializerOptions.Web) ?? throw new InvalidOperationException($"Unable to get ZeroTier status from VM {vmid} on node {node}.");
    }

    public async Task<string> InstallZeroTierAsync(string site, string node, int vmid, CancellationToken cancellationToken = default)
    {
        var pveClientFactory = serviceCollection.GetRequiredService<IPVEClientFactory>();
        var pveClient = await pveClientFactory.CreateClientAsync(site, cancellationToken);
        var aptGetUpdateResponse = await pveClient.QemuAgentExecAsync(node, vmid, "apt-get update", cancellationToken);

        return await pveClient.QemuAgentExecAsync(node, vmid, "curl -s https://install.zerotier.com | sudo bash", cancellationToken);
    }

    public async Task<ZTNetworkMembership> JoinNetworkAsync(string site, string node, int vmid, string networkId, string memberName, IPAddress[] ipAddresses, DatacenterSettings datacenterSettings, CancellationToken cancellationToken = default)
    {
        var pveClientFactory = serviceCollection.GetRequiredService<IPVEClientFactory>();
        var pveClient = await pveClientFactory.CreateClientAsync(site, cancellationToken);
        var joinRequest = await pveClient.QemuAgentExecAsync(node, vmid, $"zerotier-cli join {networkId} -j");
        var joinNetworkMembership = JsonSerializer.Deserialize<ZTNetworkMembership>(joinRequest, System.Text.Json.JsonSerializerOptions.Web) ?? throw new InvalidOperationException($"Unable to Join ZeroTier Node from VM {vmid} on node {node} to network {networkId}.");

        var nodeConfig = await GetNodeStatusAsync(site, node, vmid, cancellationToken);

        var controllerNetworkMember = await WaitForNetworkMembershipRequestAsync(networkId, nodeConfig.Address, datacenterSettings, cancellationToken);

        if (ipAddresses.Length > 0)
        {
            var updatedControllerNetworkMember = await SetNetworkMemberIpAssignmentsAsync(networkId, nodeConfig.Address, ipAddresses, cancellationToken);
        }

        {
            var updatedControllerNetworkMember = await SetNetworkMemberNameAsync(networkId, nodeConfig.Address, memberName, cancellationToken);
        }

        var network = await GetNetworkByIdAsync(networkId, cancellationToken);

        if (network?.Config.Private == true)
        {
            var updatedControllerNetworkMember = await SetNetworkMemberAuthorizationAsync(networkId, nodeConfig.Address, true, cancellationToken);
        }

        return await WaitForNodeIPAddressAsync(site, node, vmid, networkId, datacenterSettings, cancellationToken);
    }

    public async Task<ZTNetworkMembership[]> GetNetworkMembershipAsync(string site, string node, int vmid, CancellationToken cancellationToken = default)
    {
        var pveClientFactory = serviceCollection.GetRequiredService<IPVEClientFactory>();
        var pveClient = await pveClientFactory.CreateClientAsync(site, cancellationToken);
        var listNetworksResult = await pveClient.QemuAgentExecAsync(node, vmid, "zerotier-cli listnetworks -j", cancellationToken);
        return JsonSerializer.Deserialize<ZTNetworkMembership[]>(listNetworksResult, System.Text.Json.JsonSerializerOptions.Web) ?? throw new InvalidOperationException($"Unable to list ZeroTier Networks from VM {vmid} on node {node}.");
    }

    public async Task<ZTNetworkMembership?> GetNetworkMembershipAsync(string site, string node, int vmid, string networkId, CancellationToken cancellationToken = default)
    {
        return (await GetNetworkMembershipAsync(site, node, vmid, cancellationToken)).FirstOrDefault(x => x.Id == networkId);
    }

    private async Task<ZTMember> WaitForNetworkMembershipRequestAsync(string networkId, string memberId, DatacenterSettings datacenterSettings, CancellationToken cancellationToken = default)
    {
        // var datacenterSettings = await settingService.GetDatacenterSettingsAsync(cancellationToken);
        var stopwatch = Stopwatch.StartNew();
        do
        {
            //var networkMembers = await GetNetworkMembersAsync(networkId, cancellationToken);


            //if (networkMembers.TryGetValue(memberId, out var status))
            //{
            //    return await GetNetworkMemberByIdAsync(networkId, memberId, cancellationToken);
            //}
            var member = await GetNetworkMemberByIdAsync(networkId, memberId, cancellationToken);
            if (member != null)
            {
                return member;
            }

            if (stopwatch.Elapsed.TotalSeconds > datacenterSettings.WaitForZeroTierMembershipRequestTimeoutSeconds)
                throw new TimeoutException($"Waiting for Network Membership Request of Node '{memberId}' timed out after {datacenterSettings.WaitForZeroTierMembershipRequestTimeoutSeconds} seconds.");

            await Task.Delay(datacenterSettings.WaitForZeroTierMembershipRequestPollingDelayMilliseconds, cancellationToken);
        } while (true);
    }

    private async Task<ZTNetworkMembership> WaitForNodeIPAddressAsync(string site, string node, int vmid, string networkId, DatacenterSettings datacenterSettings, CancellationToken cancellationToken = default)
    {
        // var datacenterSettings = await settingService.GetDatacenterSettingsAsync(cancellationToken);
        var stopwatch = Stopwatch.StartNew();
        do
        {
            var network = await GetNetworkMembershipAsync(site, node, vmid, networkId, cancellationToken);

            if (network != null && network.AssignedAddresses != null && network.AssignedAddresses.Length > 0)
            {
                return network;
            }

            if (stopwatch.Elapsed.TotalSeconds > datacenterSettings.WaitForZeroTierMembershipRequestTimeoutSeconds)
                throw new TimeoutException($"Waiting for ZeroTeir IP Addresss assignment for VM {vmid} on node {node} to network '{networkId}' timed out after {datacenterSettings.WaitForZeroTierMembershipRequestTimeoutSeconds} seconds.");

            await Task.Delay(datacenterSettings.WaitForZeroTierMembershipRequestPollingDelayMilliseconds, cancellationToken);
        } while (true);
    }


    public async Task<MicroDataCenterEndpoint[]> GetMicroDataCenterEndpointsAsync(CancellationToken cancellationToken = default)
    {
        var network = await GetNetworkByIdAsync(options.Value.MDCNetworkId, cancellationToken);
        List<(IPAddress start, IPAddress end)> ipAssignmentPools = new();
        foreach (var pool in network.Config.IpAssignmentPools)
        {
            if (IPAddress.TryParse(pool.IPRangeStart, out var start) && IPAddress.TryParse(pool.IPRangeEnd, out var end))
            {
                ipAssignmentPools.Add((start, end));
            }
        }

        var members = await GetNetworkMembersAsync(options.Value.MDCNetworkId, cancellationToken);

        List<MicroDataCenterEndpoint> mdcEndpoints = new();

        // The members that have an IP assignment outside of the all IP Assignment Pools considered MDC members
        foreach (var member in members.Where(i => i.NodeId != i.ControllerId))
        {
            if (string.IsNullOrEmpty(member.Description))
                continue;
            foreach (var ipAssignment in member.Config.IPAssignments ?? [])
            {
                if (IPAddress.TryParse(ipAssignment, out var ipAddress))
                {
                    bool isInAnyRange = false;
                    foreach (var (start, end) in ipAssignmentPools)
                    {
                        if (IsInRange(ipAddress, start, end))
                        {
                            isInAnyRange = true;
                            break;
                        }
                    }
                    if (!isInAnyRange)
                    {
                        var pveClientOptions = JsonSerializer.Deserialize<PVEClientServiceOptions>(member.Description, JsonSerializerOptions.Web);
                        if (pveClientOptions == null)
                            continue;
                        mdcEndpoints.Add(new MicroDataCenterEndpoint
                        {
                            PVEClientConfiguration = pveClientOptions,
                            IPAddress = ipAddress,
                            ZTMember = member
                        });
                        break;
                    }
                }
            }
        }

        return mdcEndpoints.ToArray();
    }

    private static bool IsInRange(IPAddress ipToTest, IPAddress rangeStart, IPAddress rangeEnd)
    {
        byte[] testBytes = ipToTest.GetAddressBytes();
        byte[] startBytes = rangeStart.GetAddressBytes();
        byte[] endBytes = rangeEnd.GetAddressBytes();

        // Ensure IP addresses are of the same family (IPv4 or IPv6)
        if (testBytes.Length != startBytes.Length || testBytes.Length != endBytes.Length)
        {
            throw new ArgumentException("IP addresses must be of the same family (IPv4 or IPv6).");
        }

        bool greaterThanOrEqualStart = true;
        bool lessThanOrEqualEnd = true;

        for (int i = 0; i < testBytes.Length; i++)
        {
            if (testBytes[i] < startBytes[i])
            {
                greaterThanOrEqualStart = false;
                break;
            }
            if (testBytes[i] > startBytes[i])
            {
                break; // testBytes[i] is greater, so no need to check further for start
            }
        }

        for (int i = 0; i < testBytes.Length; i++)
        {
            if (testBytes[i] > endBytes[i])
            {
                lessThanOrEqualEnd = false;
                break;
            }
            if (testBytes[i] < endBytes[i])
            {
                break; // testBytes[i] is smaller, so no need to check further for end
            }
        }

        return greaterThanOrEqualStart && lessThanOrEqualEnd;
    }
}