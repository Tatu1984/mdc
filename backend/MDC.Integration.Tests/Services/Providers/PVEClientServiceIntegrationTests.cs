using MDC.Core.Extensions;
using MDC.Core.Models;
using MDC.Core.Services.Providers.PVEClient;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Microsoft.VisualStudio.TestPlatform.CommunicationUtilities.Resources;
using System.Reflection;
using System.Runtime.Intrinsics.Arm;
using System.Threading;

/*  These tests requires the following user secrets to be set up in the MDC.IntegrationTests project.
{
  "PVEClientService": {
    "baseUrl": "https://<ProxMox Address>:8006/api2/json/",
    "authenticationScheme": "PVEAPIToken",
    "tokenId": "<API Access Token>",
    "secret": "<API Access Token Secret>",
    "validateServerCertificate": false <!-- Optional: Set to true in production (default), false for testing -->
  }
} 
*/

namespace MDC.Integration.Tests.Services.Providers;

public class PVEClientServiceIntegrationTests : BaseIntegrationTests
{
    [Theory]
    [ClassData(typeof(TheoryConfigurationKeys))]
    public void ConfigurationTest(string theoryConfigurationKey)
    {
        IServiceCollection serviceDescriptors = new ServiceCollection();
        using IServiceScope serviceScope = AssembleIntegrationTest(serviceDescriptors, theoryConfigurationKey);

        var options = serviceScope.ServiceProvider.GetRequiredService<IOptions<PVEClientServiceOptions>>();
        Assert.NotNull(options);
        var option = options.Value;
        Assert.NotNull(option);

        Assert.NotEmpty(option.BaseUrl);
        Assert.NotNull(option.AuthenticationScheme);
        Assert.Equal("PVEAPIToken", option.AuthenticationScheme);
        Assert.NotNull(option.TokenId);
        Assert.NotNull(option.Secret);
    }

    [Theory]
    [ClassData(typeof(TheoryConfigurationKeys))]
    public async Task GetClusterStatusAsync(string theoryConfigurationKey)
    {
        IServiceCollection serviceDescriptors = new ServiceCollection();
        using IServiceScope serviceScope = AssembleIntegrationTest(serviceDescriptors, theoryConfigurationKey);

        var pveClientService = serviceScope.ServiceProvider.GetRequiredService<IPVEClientService>();
        Assert.NotNull(pveClientService);
        Assert.IsType<PVEClientService>(pveClientService);

        // ACT: Call the method to get the cluster status
        var clusterStatus = await pveClientService.GetClusterStatusAsync();
        Assert.NotNull(clusterStatus);
        Assert.NotEmpty(clusterStatus);

        var datacenterNode = DatacenterFactory.GetDatacenterCluster(clusterStatus);
        Assert.NotNull(datacenterNode);
        Assert.NotNull(datacenterNode.Name);
        Assert.NotEmpty(datacenterNode.Name);
    }

    [Theory]
    [ClassData(typeof(TheoryConfigurationKeys))]
    public async Task GetClusterResourcesAsync(string theoryConfigurationKey)
    {
        IServiceCollection serviceDescriptors = new ServiceCollection();
        using IServiceScope serviceScope = AssembleIntegrationTest(serviceDescriptors, theoryConfigurationKey);

        var pveClientService = serviceScope.ServiceProvider.GetRequiredService<IPVEClientService>();
        Assert.NotNull(pveClientService);
        Assert.IsType<PVEClientService>(pveClientService);

        // ACT: Call the method to get the cluster resources
        var clusterResources = await pveClientService.GetClusterResourcesAsync();
        Assert.NotNull(clusterResources);
        Assert.NotEmpty(clusterResources);
    }

    [Theory]
    [ClassData(typeof(TheoryConfigurationKeys))]
    public async Task GetQemuConfigAsync(string theoryConfigurationKey)
    {
        IServiceCollection serviceDescriptors = new ServiceCollection();
        using IServiceScope serviceScope = AssembleIntegrationTest(serviceDescriptors, theoryConfigurationKey);

        var pveClientService = serviceScope.ServiceProvider.GetRequiredService<IPVEClientService>();
        Assert.NotNull(pveClientService);
        Assert.IsType<PVEClientService>(pveClientService);

        var clusterResources = await pveClientService.GetClusterResourcesAsync();
        Assert.NotNull(clusterResources);

        // ACT: Call the method to get the QEMU VM configurations for all QEMU resources in the cluster
        var configs = await Task.WhenAll(clusterResources.Where(resource => resource.Type == PVEResourceType.Qemu)
            .Select(async resource =>
            {
                Assert.NotNull(resource.Node);
                Assert.NotNull(resource.VmId);

                var qemuConfig = await pveClientService.GetQemuConfigAsync(resource.Node, resource.VmId.Value);
                Assert.NotNull(qemuConfig);

                return qemuConfig;
            })
        );

        Assert.NotEmpty(configs);
    }

    [Theory]
    [ClassData(typeof(TheoryConfigurationKeys))]
    public async Task CreateQemuCloneAsync(string theoryConfigurationKey)
    {
        IServiceCollection serviceDescriptors = new ServiceCollection();
        using IServiceScope serviceScope = AssembleIntegrationTest(serviceDescriptors, theoryConfigurationKey);

        var pve = serviceScope.ServiceProvider.GetRequiredService<IPVEClientService>();
        Assert.NotNull(pve);
        Assert.IsType<PVEClientService>(pve);

        var pveResources = await pve.GetClusterResourcesAsync();
        Assert.NotNull(pveResources);

        var template = pveResources.FirstOrDefault(i => i.Template == true && i.Node != null && i.VmId != null && i.Name == "BA00.UbuntuDesktop");
        Assert.NotNull(template);
        Assert.NotNull(template.Node);
        Assert.NotNull(template.VmId);

        var targetName = $"9999{template.Name}-IntegrationTest";
        var targetNode = template.Node;
        foreach (var resource in pveResources.Where(i => i.Name == targetName))
        {
            Assert.NotNull(resource.Node);
            Assert.NotNull(resource.VmId);
            var deleteUpid = await pve.DeleteQemuAsync(resource.Node, resource.VmId.Value, true, true);
            Assert.NotNull(deleteUpid);

            await pve.WaitForTaskAsync(targetNode, deleteUpid);
        }
        
        // ACT
        var (vmid, upid) = await pve.CreateQemuCloneAsync(template.Node, template.VmId.Value, targetName, targetNode);
        Assert.NotNull(upid);
        await pve.WaitForTaskAsync(targetNode, upid);

        var qemuConfig = await pve.GetQemuConfigAsync(targetNode, vmid);
        Assert.NotNull(qemuConfig);
        var networkDevices = qemuConfig.ParseNetworkAdapters();
        Assert.NotEmpty(networkDevices);

        var cleanupUpid = await pve.DeleteQemuAsync(targetNode, vmid, true, true);
        Assert.NotNull(cleanupUpid);
        await pve.WaitForTaskAsync(targetNode, cleanupUpid);
    }

    [Theory]
    [ClassData(typeof(TheoryConfigurationKeys))]
    public async Task GetQemuStatusCurrentAsync(string theoryConfigurationKey)
    {
        IServiceCollection serviceDescriptors = new ServiceCollection();
        using IServiceScope serviceScope = AssembleIntegrationTest(serviceDescriptors, theoryConfigurationKey);

        var pveClientService = serviceScope.ServiceProvider.GetRequiredService<IPVEClientService>();
        Assert.NotNull(pveClientService);
        Assert.IsType<PVEClientService>(pveClientService);

        var clusterResources = await pveClientService.GetClusterResourcesAsync();
        Assert.NotNull(clusterResources);

        // ACT: Call the method to get the Qemu current status for all QEMU resources in the cluster
        var statuses = await Task.WhenAll(clusterResources.Where(resource => resource.Type == PVEResourceType.Qemu)
            .Select(async resource =>
            {
                Assert.NotNull(resource.Node);
                Assert.NotNull(resource.VmId);

                var qemuStatus = await pveClientService.GetQemuStatusCurrentAsync(resource.Node, resource.VmId.Value);
                Assert.NotNull(qemuStatus);
                return qemuStatus;
            }));
        Assert.NotEmpty(statuses);
    }

    [Theory]
    [ClassData(typeof(TheoryConfigurationKeys))]
    public async Task QemuAgentPingAsync(string theoryConfigurationKey)
    {
        IServiceCollection serviceDescriptors = new ServiceCollection();
        using IServiceScope serviceScope = AssembleIntegrationTest(serviceDescriptors, theoryConfigurationKey);

        var pveClientService = serviceScope.ServiceProvider.GetRequiredService<IPVEClientService>();
        Assert.NotNull(pveClientService);
        Assert.IsType<PVEClientService>(pveClientService);

        var clusterResources = await pveClientService.GetClusterResourcesAsync();
        Assert.NotNull(clusterResources);

        // ACT: Call the method to get the Qemu current status and ping the agent for all QEMU resources in the cluster
        var statuses = await Task.WhenAll(clusterResources.Where(resource => resource.Type == PVEResourceType.Qemu && resource.Template != true)
            .Select(async resource =>
            {
                Assert.NotNull(resource.Node);
                Assert.NotNull(resource.VmId);

                var qemuStatus = await pveClientService.GetQemuStatusCurrentAsync(resource.Node, resource.VmId.Value);
                Assert.NotNull(qemuStatus);

                if (qemuStatus.Qmpstatus == "running" && qemuStatus.Agent == 1)
                {
                    var pingResult = await pveClientService.QemuAgentPingAsync(resource.Node, resource.VmId.Value);
                    Assert.True(pingResult);
                }

                return qemuStatus;
            }));

        Assert.NotEmpty(statuses);
    }

    [Theory]
    [ClassData(typeof(TheoryConfigurationKeys))]
    public async Task QemuAgentGetNetworkInterfacesAsync(string theoryConfigurationKey)
    {
        IServiceCollection serviceDescriptors = new ServiceCollection();
        using IServiceScope serviceScope = AssembleIntegrationTest(serviceDescriptors, theoryConfigurationKey);

        var pveClientService = serviceScope.ServiceProvider.GetRequiredService<IPVEClientService>();
        Assert.NotNull(pveClientService);
        Assert.IsType<PVEClientService>(pveClientService);

        var clusterResources = await pveClientService.GetClusterResourcesAsync();
        Assert.NotNull(clusterResources);

        // ACT: Call the method to get the Qemu current status and ping the agent for all QEMU resources in the cluster
        var results = await Task.WhenAll(clusterResources.Where(resource => resource.Type == PVEResourceType.Qemu && resource.Template != true)
            .Select(async resource =>
            {
                Assert.NotNull(resource.Node);
                Assert.NotNull(resource.VmId);

                var qemuStatus = await pveClientService.GetQemuStatusCurrentAsync(resource.Node, resource.VmId.Value);
                Assert.NotNull(qemuStatus);

                if (qemuStatus.Qmpstatus == "running" && qemuStatus.Agent == 1)
                {
                    var pingResult = await pveClientService.QemuAgentPingAsync(resource.Node, resource.VmId.Value);
                    Assert.True(pingResult);

                    var networkInterfaces = await pveClientService.QemuAgentGetNetworkInterfacesAsync(resource.Node, resource.VmId.Value);
                    Assert.NotNull(networkInterfaces);

                    return (qemuStatus, networkInterfaces);
                }

                return (qemuStatus, []);
            }));

        Assert.NotEmpty(results);
    }

    [Theory]
    [ClassData(typeof(TheoryConfigurationKeys))]
    public async Task QemuAgentExecAsync(string theoryConfigurationKey)
    {
        IServiceCollection serviceDescriptors = new ServiceCollection();
        using IServiceScope serviceScope = AssembleIntegrationTest(serviceDescriptors, theoryConfigurationKey);

        var pveClientService = serviceScope.ServiceProvider.GetRequiredService<IPVEClientService>();
        Assert.NotNull(pveClientService);
        Assert.IsType<PVEClientService>(pveClientService);

        var clusterResources = await pveClientService.GetClusterResourcesAsync();
        Assert.NotNull(clusterResources);

        // ACT: Call the method to get the Qemu current status and ping the agent for all QEMU resources in the cluster
        var results = await Task.WhenAll(clusterResources.Where(resource => resource.Type == PVEResourceType.Qemu && resource.Template != true)
            .Take(1)
            .Select(async resource =>
            {
                Assert.NotNull(resource.Node);
                Assert.NotNull(resource.VmId);

                var qemuStatus = await pveClientService.GetQemuStatusCurrentAsync(resource.Node, resource.VmId.Value);
                Assert.NotNull(qemuStatus);

                if (qemuStatus.Qmpstatus == "running" && qemuStatus.Agent == 1)
                {
                    var pingResult = await pveClientService.QemuAgentPingAsync(resource.Node, resource.VmId.Value);
                    Assert.True(pingResult);

                    var response = await pveClientService.QemuAgentExecAsync(resource.Node, resource.VmId.Value, "ls -la");
                    Assert.NotNull(response);

                    return (qemuStatus, (string?)response);
                }

                return (qemuStatus, null);
            }));
        Assert.NotEmpty(results);
    }

    [Theory(Skip = "Hard-coded values used")]
    [ClassData(typeof(TheoryConfigurationKeys))]
    public async Task QemuAgentExecAsync_ZeroTierCli_Info(string theoryConfigurationKey)
    {
        IServiceCollection serviceDescriptors = new ServiceCollection();
        using IServiceScope serviceScope = AssembleIntegrationTest(serviceDescriptors, theoryConfigurationKey);

        var pveClientService = serviceScope.ServiceProvider.GetRequiredService<IPVEClientService>();
        Assert.NotNull(pveClientService);
        Assert.IsType<PVEClientService>(pveClientService);

        var response = await pveClientService.QemuAgentExecAsync("node03", 110, $"zerotier-cli info -j");

        Assert.NotNull(response);
    }
}
