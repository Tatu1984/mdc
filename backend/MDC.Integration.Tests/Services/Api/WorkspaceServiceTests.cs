using MDC.Core.Extensions;
using MDC.Core.Services.Api;
using MDC.Core.Services.Providers.MDCDatabase;
using MDC.Shared.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace MDC.Integration.Tests.Services.Api;

public class WorkspaceServiceTests : BaseIntegrationTests
{
    private const string WorkspaceName = "IntegrationTest";
    private const string VirtualNetworkName = "IntegrationTestVNet";
    private const string VirtualMachineName = "IntegrationTestVM";

    private async Task DeleteWorkspaceAsync(IServiceScope serviceScope, string site)
    {
        var workspaceService = serviceScope.ServiceProvider.GetRequiredService<IWorkspaceService>();

        var existingWorkpaces = await workspaceService.GetAllAsync(site);
        foreach (var existing in existingWorkpaces.Where(i => i.Name == WorkspaceName))
        {
            await workspaceService.DeleteAsync(site, existing.Id);
        }
    }

    private async Task<Workspace> CreateWorkspaceAsync(IServiceScope serviceScope, string site, int? numNetworks = null, VirtualMachineDescriptor[]? virtualMachineDescriptors = null, bool? hasRemoteNetwork = false)
    {
        // await serviceScope.UseMicroDatacenterMigrationsAsync();

        var workspaceService = serviceScope.ServiceProvider.GetRequiredService<IWorkspaceService>();

        var descriptor = new WorkspaceDescriptor
        {
            Name = WorkspaceName
        };

        if (numNetworks.HasValue)
        {
            List<VirtualNetworkDescriptor> list = new List<VirtualNetworkDescriptor>();

            for (int i = 0; i < numNetworks.Value; i++)
            {
                list.Add(new VirtualNetworkDescriptor
                {
                    EnableRemoteNetwork = hasRemoteNetwork.HasValue ? hasRemoteNetwork.Value && i == 0 : false,
                    Name = $"{VirtualNetworkName}{i:D2}",
                    Gateway = new VirtualNetworkGatewayDescriptor
                    {
                        WANNetworkType = i == 0 ? VirtualNetworkGatewayWANNetworkType.Egress : VirtualNetworkGatewayWANNetworkType.Internal,
                        RefInternalWANVirtualNetworkName = i == 0 ? null : $"{VirtualNetworkName}{i-1:D2}"
                    }
                });
            }

            descriptor.VirtualNetworks = list.ToArray();
        }

        descriptor.VirtualMachines = virtualMachineDescriptors;

        var workspace = await workspaceService.CreateAsync(site, descriptor);
        Assert.Equal(descriptor.Name, workspace.Name);

        // Validate the Bastion property is populated
        Assert.NotNull(workspace.Bastion);
        Assert.Equal(0, workspace.Bastion.Index);
        Assert.Equal(descriptor.Name, workspace.Bastion.Name);
        Assert.Equal("running", workspace.Bastion.Status);
        Assert.NotNull(workspace.Bastion.NetworkAdapters);
        Assert.NotEmpty(workspace.Bastion.NetworkAdapters);
        Assert.Equal(numNetworks ?? 1, workspace.Bastion.NetworkAdapters.Length);
        if (hasRemoteNetwork == true)
        {
            foreach (var networkAdapter in workspace.Bastion.NetworkAdapters)
            {
                Assert.NotNull(networkAdapter.NetworkInterfaces);
                var ztNetwork = networkAdapter.NetworkInterfaces.FirstOrDefault(i => i.Name.StartsWith("zt"));
                Assert.NotNull(ztNetwork);
            }
        }
        else
        {
            Assert.All(workspace.Bastion.NetworkAdapters, adapter => Assert.NotNull(adapter.VirtualNetworkId));
        }

        // These values will be set if the Create() waited for the VMs to boot and agent is running
        //Assert.All(workspace.Bastion.NetworkAdapters, adapter => Assert.NotNull(adapter.NetworkInterfaces));
        //Assert.All(workspace.Bastion.NetworkAdapters, adapter => Assert.NotEmpty(adapter.NetworkInterfaces!));

        // Validate the Virtual Networks are created
        Assert.NotEmpty(workspace.VirtualNetworks);
        if (numNetworks == null)
        {
            Assert.Single(workspace.VirtualNetworks);
            var virtualNetwork = workspace.VirtualNetworks.First();
            Assert.Equal("vnet0", virtualNetwork.Name);
            Assert.Equal(0, virtualNetwork.Index);
            Assert.Null(virtualNetwork.RemoteNetworkId);
        }
        else
        {
            Assert.Equal(numNetworks.Value, workspace.VirtualNetworks.Length);
            for (int i = 0; i < numNetworks.Value; i++)
            {
                Assert.Single(workspace.VirtualNetworks, vn => vn.Index == i);
                var virtualNetwork = workspace.VirtualNetworks.Single(vn => vn.Index == i);
                Assert.Equal($"{VirtualNetworkName}{i:D2}", virtualNetwork.Name);

                if (hasRemoteNetwork == true)
                {
                    Assert.NotNull(virtualNetwork.RemoteNetworkId);
                    Assert.NotEmpty(virtualNetwork.RemoteNetworkId);
                }
                else
                {
                    Assert.Null(virtualNetwork.RemoteNetworkId);
                }
            }
        }

        if (virtualMachineDescriptors != null)
        {
            foreach (var virtualMachineDescriptor in virtualMachineDescriptors)
            {
                Assert.Single(workspace.VirtualMachines, i => i.Name == virtualMachineDescriptor.Name);
                var virtualMachine = workspace.VirtualMachines.Single(i => i.Name == virtualMachineDescriptor.Name);
                
                Assert.NotNull(virtualMachine.NetworkAdapters);
                Assert.NotEmpty(virtualMachine.NetworkAdapters);
            }
        }

        var workspaces = await workspaceService.GetAllAsync(site);
        Assert.NotEmpty(workspaces);
        Assert.Single(workspaces, i => i.Id == workspace.Id);

        return workspace;
    }

    [Theory]
    [ClassData(typeof(TheoryConfigurationKeys))]
    public void GetWorkspaceService(string theoryConfigurationKey)
    {
        IServiceCollection serviceDescriptors = new ServiceCollection();
        using IServiceScope serviceScope = AssembleIntegrationTest(serviceDescriptors, theoryConfigurationKey);

        var service = serviceScope.ServiceProvider.GetRequiredService<IWorkspaceService>();
        Assert.NotNull(service);
        Assert.IsType<WorkspaceService>(service);
    }

    [Theory]
    [ClassData(typeof(TheoryConfigurationKeys))]
    public async Task GetAllAsync(string theoryConfigurationKey)
    {
        IServiceCollection serviceDescriptors = new ServiceCollection();
        using IServiceScope serviceScope = AssembleIntegrationTest(serviceDescriptors, theoryConfigurationKey);

        var service = serviceScope.ServiceProvider.GetRequiredService<IWorkspaceService>();
        Assert.NotNull(service);
        Assert.IsType<WorkspaceService>(service);

        // ACT: Call the method to get the workspaces data
        var workspaces = await service.GetAllAsync(theoryConfigurationKey);
        Assert.NotNull(workspaces);
        Assert.NotEmpty(workspaces);

        var dbContext = serviceScope.ServiceProvider.GetRequiredService<MDCDbContext>();
        Assert.NotNull(dbContext);

        var dbWorkspaces = await dbContext.Workspaces.Where(ws => ws.Datacenter!.Name == theoryConfigurationKey).ToArrayAsync();
        Assert.NotNull(dbWorkspaces);
        Assert.NotEmpty(dbWorkspaces);

        foreach (var dbWorkspace in dbWorkspaces)
        {
            Assert.Single(workspaces, i => i.Id == dbWorkspace.Id);   
            var workspace = workspaces.Single(i => i.Id == dbWorkspace.Id);
            Assert.Equal(dbWorkspace.Name, workspace.Name);

            var dbVirtualNetworks = await dbContext.VirtualNetworks
                .Where(vn => vn.WorkspaceId == dbWorkspace.Id)
                .ToArrayAsync();
            Assert.Equal(dbVirtualNetworks.Length, workspace.VirtualNetworks.Count());
        }
    }

    [Theory]
    [ClassData(typeof(TheoryConfigurationKeys))]
    public async Task GetByIdAsync(string theoryConfigurationKey)
    {
        IServiceCollection serviceDescriptors = new ServiceCollection();
        using IServiceScope serviceScope = AssembleIntegrationTest(serviceDescriptors, theoryConfigurationKey);

        var service = serviceScope.ServiceProvider.GetRequiredService<IWorkspaceService>();
        Assert.NotNull(service);
        Assert.IsType<WorkspaceService>(service);

        var dbContext = serviceScope.ServiceProvider.GetRequiredService<MDCDbContext>();
        Assert.NotNull(dbContext);

        var dbWorkspaces = await dbContext.Workspaces
            .Where(i => i.Datacenter!.Name == theoryConfigurationKey)
            .Include(i => i.VirtualNetworks)
            .ToArrayAsync();
        Assert.NotNull(dbWorkspaces);
        Assert.NotEmpty(dbWorkspaces);

        // ACT: Call the method to get the workspaces data
        foreach (var dbWorkspace in dbWorkspaces)
        {
            var workspace = await service.GetByIdAsync(theoryConfigurationKey, dbWorkspace.Id);
            Assert.NotNull(workspace);

            Assert.Equal(dbWorkspace.Id, workspace.Id);
            Assert.Equal(dbWorkspace.Name, workspace.Name);
            Assert.Equal(dbWorkspace.Address, workspace.Address);
            Assert.Equal(dbWorkspace.VirtualNetworks.Count, workspace.VirtualNetworks.Count());
        }
    }

    [Theory]
    [ClassData(typeof(TheoryConfigurationKeys))]
    public async Task CreateWorkspaceAsync_Minimal(string theoryConfigurationKey)
    {
        IServiceCollection serviceDescriptors = new ServiceCollection();
        using IServiceScope serviceScope = AssembleIntegrationTest(serviceDescriptors, theoryConfigurationKey);

        await DeleteWorkspaceAsync(serviceScope, theoryConfigurationKey);

        // ACT: Call the method to get the workspaces data
        var workspace = await CreateWorkspaceAsync(serviceScope, theoryConfigurationKey);
        
        await DeleteWorkspaceAsync(serviceScope, theoryConfigurationKey);
    }

    [Theory]
    [ClassData(typeof(TheoryConfigurationKeys))]
    public async Task CreateWorkspaceAsync_TwoVirtualNetworks(string theoryConfigurationKey)
    {
        IServiceCollection serviceDescriptors = new ServiceCollection();
        using IServiceScope serviceScope = AssembleIntegrationTest(serviceDescriptors, theoryConfigurationKey);

        await DeleteWorkspaceAsync(serviceScope, theoryConfigurationKey);

        // ACT: Call the method to get the workspaces data
        var workspace = await CreateWorkspaceAsync(serviceScope, theoryConfigurationKey, 2);

        await DeleteWorkspaceAsync(serviceScope, theoryConfigurationKey);
    }

    [Theory]
    [ClassData(typeof(TheoryConfigurationKeys))]
    public async Task CreateWorkspaceAsync_VirtualMachine(string theoryConfigurationKey)
    {
        IServiceCollection serviceDescriptors = new ServiceCollection();
        using IServiceScope serviceScope = AssembleIntegrationTest(serviceDescriptors, theoryConfigurationKey);

        await DeleteWorkspaceAsync(serviceScope, theoryConfigurationKey);

        // ACT: Call the method to get the workspaces data
        var workspace = await CreateWorkspaceAsync(serviceScope, theoryConfigurationKey, null, [new VirtualMachineDescriptor
        {
            TemplateName = "UbuntuDesktop",
        }]);

        await DeleteWorkspaceAsync(serviceScope, theoryConfigurationKey);
    }

    [Theory]
    [ClassData(typeof(TheoryConfigurationKeys))]
    public async Task UpdateWorkspaceAsync_AddVirtualMachine(string theoryConfigurationKey)
    {
        IServiceCollection serviceDescriptors = new ServiceCollection();
        using IServiceScope serviceScope = AssembleIntegrationTest(serviceDescriptors, theoryConfigurationKey);

        var service = serviceScope.ServiceProvider.GetRequiredService<IWorkspaceService>();
        Assert.NotNull(service);
        Assert.IsType<WorkspaceService>(service);

        await DeleteWorkspaceAsync(serviceScope, theoryConfigurationKey);

        // ACT: Call the method to get the workspaces data
        var workspace = await CreateWorkspaceAsync(serviceScope, theoryConfigurationKey);

        var delta = JsonSerializer.SerializeToNode(new
        {
            VirtualMachines = new[]
            {
                new 
                {
                    TemplateName = "UbuntuDesktop",
                    Name = VirtualMachineName
                }
            }
        }, JsonSerializerOptions.Web);
        Assert.NotNull(delta);

        var updatedWorkspace = await service.UpdateAsync(theoryConfigurationKey, workspace.Id, delta);

        await DeleteWorkspaceAsync(serviceScope, theoryConfigurationKey);
    }

    [Theory]
    [ClassData(typeof(TheoryConfigurationKeys))]
    public async Task CreateWorkspaceAsync_RemoteNetwork(string theoryConfigurationKey)
    {
        IServiceCollection serviceDescriptors = new ServiceCollection();
        using IServiceScope serviceScope = AssembleIntegrationTest(serviceDescriptors, theoryConfigurationKey);

        await DeleteWorkspaceAsync(serviceScope, theoryConfigurationKey);

        // ACT: Call the method to get the workspaces data
        var workspace = await CreateWorkspaceAsync(serviceScope, theoryConfigurationKey, 1, null, true);

        await DeleteWorkspaceAsync(serviceScope, theoryConfigurationKey);
    }
}
