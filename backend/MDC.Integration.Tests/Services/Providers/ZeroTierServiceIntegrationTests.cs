using MDC.Core.Services.Providers.PVEClient;
using MDC.Core.Services.Providers.ZeroTier;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using System.Text.Json;

namespace MDC.Integration.Tests.Services.Providers;

public class ZeroTierServiceIntegrationTests : BaseIntegrationTests
{
    private const string NetworkName = "MDCIntegrationTests";

    [Theory]
    [ClassData(typeof(TheoryConfigurationKeys))]
    public void ConfigurationTest(string theoryConfigurationKey)
    {
        IServiceCollection serviceDescriptors = new ServiceCollection();
        using IServiceScope serviceScope = AssembleIntegrationTest(serviceDescriptors, theoryConfigurationKey);

        var options = serviceScope.ServiceProvider.GetRequiredService<IOptions<ZeroTierServiceOptions>>();
        Assert.NotNull(options);
        var option = options.Value;
        Assert.NotNull(option);

        Assert.NotEmpty(option.BaseUrl);
        Assert.NotNull(option.Username);
        Assert.NotNull(option.Password);
    }

    [Theory]
    [ClassData(typeof(TheoryConfigurationKeys))]
    public async Task GetStatusAsync(string theoryConfigurationKey)
    {
        IServiceCollection serviceDescriptors = new ServiceCollection();
        using IServiceScope serviceScope = AssembleIntegrationTest(serviceDescriptors, theoryConfigurationKey);

        var service = serviceScope.ServiceProvider.GetRequiredService<IZeroTierService>();
        Assert.NotNull(service);

        var status = await service.GetStatusAsync();
        Assert.NotNull(status);
        Assert.NotNull(status.Address);
        Assert.NotEmpty(status.Address);

        var networks = await service.GetNetworksAsync();
        Assert.NotNull(networks);
        Assert.NotEmpty(networks);

        foreach (var network in networks)
        {
            var networkDetail = await service.GetNetworkByIdAsync(network.Id);
            Assert.NotNull(networkDetail);
            Assert.Equal(network.Id, networkDetail.Id);

            var members = await service.GetNetworkMembersAsync(networkDetail.Id);
            Assert.NotNull(members);

            foreach (var member in members)
            {
                var memberDetail = await service.GetNetworkMemberByIdAsync(networkDetail.Id, member.NodeId);
                Assert.NotNull(memberDetail);
                Assert.Equal(member.Id, memberDetail.Id);
                Assert.Equal(member.NodeId, memberDetail.NodeId);
            }
        }
    }

    private async Task CleanupNetworks(IZeroTierService service)
    {
        List<string> networksToDelete = new List<string>();

        var networks = await service.GetNetworksAsync();
        foreach (var network in networks)
        {
            if (network.Config.Name == NetworkName)
            {
                networksToDelete.Add(network.Id);
                await service.DeleteNetworkAsync(network.Id);
            }
        }

        if (networksToDelete.Count == 0)
            return;

        var updpated = await service.GetNetworksAsync();
        foreach (var networkId in networksToDelete)
        {
            Assert.DoesNotContain(networkId, updpated.Select(i => i.Config.Name));
        }
    }

    [Theory]
    [ClassData(typeof(TheoryConfigurationKeys))]
    public async Task ManageNetworkAsync(string theoryConfigurationKey)
    {
        IServiceCollection serviceDescriptors = new ServiceCollection();
        using IServiceScope serviceScope = AssembleIntegrationTest(serviceDescriptors, theoryConfigurationKey);

        var service = serviceScope.ServiceProvider.GetRequiredService<IZeroTierService>();
        Assert.NotNull(service);

        await CleanupNetworks(service);

        var createdNetwork = await service.CreateNetworkAsync(NetworkName, new Shared.Models.VirtualNetworkDescriptor { Name = "vnet0" }, new Shared.Models.DatacenterSettings());
        Assert.NotNull(createdNetwork);
        Assert.Equal(NetworkName, createdNetwork.Config.Name);
        Assert.True(createdNetwork.Config.Private);
        Assert.NotNull(createdNetwork.Id);
        Assert.NotEmpty(createdNetwork.Id);

        var networks = await service.GetNetworksAsync();
        Assert.NotNull(networks);
        Assert.NotEmpty(networks);

        Assert.Contains(createdNetwork.Id, networks.Select(i => i.Id));

        var network = await service.GetNetworkByIdAsync(createdNetwork.Id);
        Assert.NotNull(network);
        Assert.Equal(createdNetwork.Id, network.Id);

        await service.DeleteNetworkAsync(createdNetwork.Id);
        var updpated = await service.GetNetworksAsync();
        Assert.DoesNotContain(createdNetwork.Id, updpated.Select(i => i.Id));
    }

    [Theory]
    [ClassData(typeof(TheoryConfigurationKeys))]
    public async Task GetMicroDataCentersAsync(string theoryConfigurationKey)
    {
        IServiceCollection serviceDescriptors = new ServiceCollection();
        using IServiceScope serviceScope = AssembleIntegrationTest(serviceDescriptors, theoryConfigurationKey);

        var service = serviceScope.ServiceProvider.GetRequiredService<IZeroTierService>();
        Assert.NotNull(service);

        var mdcEndpoints = await service.GetMicroDataCenterEndpointsAsync();
        Assert.NotNull(mdcEndpoints);
        Assert.NotEmpty(mdcEndpoints);

        foreach (var mdcEndpoint in mdcEndpoints)
        {
            var httpClientFactory = serviceScope.ServiceProvider.GetRequiredService<IHttpClientFactory>();
            var client = httpClientFactory.CreateClient();
            client.BaseAddress = new Uri($"https://{mdcEndpoint.IPAddress}:8006/");

            var pveClient = new PVEClientService(client);
        }
    }

    //[Theory]
    [Theory(Skip = "Hard-coded values used")]
    [ClassData(typeof(TheoryConfigurationKeys))]
    public async Task GetStatusAsync_FromVM(string theoryConfigurationKey)
    {
        IServiceCollection serviceDescriptors = new ServiceCollection();
        using IServiceScope serviceScope = AssembleIntegrationTest(serviceDescriptors, theoryConfigurationKey);

        var service = serviceScope.ServiceProvider.GetRequiredService<IZeroTierService>();
        Assert.NotNull(service);

        var status = await service.GetNodeStatusAsync(theoryConfigurationKey, "node03", 110);
        Assert.NotNull(status);
        Assert.NotNull(status.Address);
        Assert.NotEmpty(status.Address);
    }
}
