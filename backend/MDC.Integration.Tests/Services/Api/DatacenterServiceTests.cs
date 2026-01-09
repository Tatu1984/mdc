using MDC.Core.Services.Api;
using MDC.Core.Services.Providers.MDCDatabase;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace MDC.Integration.Tests.Services.Api;

public class DatacenterServiceTests : BaseIntegrationTests
{
    [Theory]
    [ClassData(typeof(TheoryConfigurationKeys))]
    public async Task RegisterDatacenterAsync(string theoryConfigurationKey)
    {
        IServiceCollection serviceDescriptors = new ServiceCollection();
        using IServiceScope serviceScope = AssembleIntegrationTest(serviceDescriptors, theoryConfigurationKey);

        var datacenterService = serviceScope.ServiceProvider.GetRequiredService<IDatacenterService>();
        Assert.NotNull(datacenterService);
        Assert.IsType<DatacenterService>(datacenterService);

        var dbContext = serviceScope.ServiceProvider.GetRequiredService<MDCDbContext>();
        Assert.NotNull(dbContext);

        // ACT: Call the method to get the datacenter and recreate the database
        var datacenter = await datacenterService.RegisterDatacenterAsync(theoryConfigurationKey);
        Assert.NotNull(datacenter);
        Assert.Equal(datacenter.Name, theoryConfigurationKey);

        // Verify that the database has been recreated and contains the expected data
        var dbDataCenters = await dbContext.Datacenters.ToArrayAsync();
        Assert.NotNull(dbDataCenters);
        Assert.NotEmpty(dbDataCenters);
        Assert.Contains(dbDataCenters, i => i.Name == theoryConfigurationKey);

        var dbDatacenter = dbDataCenters.Single(i => i.Name == theoryConfigurationKey);
        Assert.NotEqual(DateTime.MinValue, dbDatacenter.CreatedAt);
        Assert.NotEqual(DateTime.MinValue, dbDatacenter.UpdatedAt);
        Assert.Equal(dbDatacenter.CreatedAt, dbDatacenter.UpdatedAt);

        var dbWorkspaces = await dbContext.Workspaces.Where(i => i.DatacenterId == dbDatacenter.Id).ToArrayAsync();
        Assert.NotNull(dbWorkspaces);
        
        foreach (var dbWorkspace in dbWorkspaces)
        {
            Assert.NotEqual(Guid.Empty, dbWorkspace.Id);
            Assert.NotEqual(DateTime.MinValue, dbWorkspace.CreatedAt);
            Assert.NotEqual(DateTime.MinValue, dbWorkspace.UpdatedAt);
            Assert.Equal(dbWorkspace.CreatedAt, dbWorkspace.UpdatedAt);
            Assert.NotNull(dbWorkspace.Name);
            Assert.NotEmpty(dbWorkspace.Name);
            Assert.NotEqual(0, dbWorkspace.Address);
            Assert.Equal(dbDatacenter.Id, dbWorkspace.DatacenterId);
        }

        var dbVirtualNetworks = await dbContext.VirtualNetworks.Where(i => i.Workspace!.DatacenterId == dbDatacenter.Id).ToArrayAsync();
        Assert.NotNull(dbVirtualNetworks);
        
        foreach (var dbVirtualNetwork in dbVirtualNetworks)
        {
            Assert.NotEqual(Guid.Empty, dbVirtualNetwork.Id);
            Assert.NotEqual(DateTime.MinValue, dbVirtualNetwork.CreatedAt);
            Assert.NotEqual(DateTime.MinValue, dbVirtualNetwork.UpdatedAt);
            Assert.Equal(dbVirtualNetwork.CreatedAt, dbVirtualNetwork.UpdatedAt);
            Assert.NotNull(dbVirtualNetwork.Name);
            Assert.NotEmpty(dbVirtualNetwork.Name);
        }
    }

    [Theory]
    [ClassData(typeof(TheoryConfigurationKeys))]
    public async Task GetDatacenterAsync(string theoryConfigurationKey)
    {
        IServiceCollection serviceDescriptors = new ServiceCollection();
        using IServiceScope serviceScope = AssembleIntegrationTest(serviceDescriptors, theoryConfigurationKey);

        var datacenterService = serviceScope.ServiceProvider.GetRequiredService<IDatacenterService>();
        Assert.NotNull(datacenterService);
        Assert.IsType<DatacenterService>(datacenterService);

        // ACT: Call the method to get the datacenter data
        var datacenter = await datacenterService.GetDatacenterAsync(theoryConfigurationKey);
        Assert.NotNull(datacenter);
        
        Assert.NotEmpty(datacenter.BastionTemplates);
        Assert.NotEmpty(datacenter.GatewayTemplates);
        Assert.NotEmpty(datacenter.VirtualMachineTemplates);


        // Verify that the datacenter matches the database
        var dbContext = serviceScope.ServiceProvider.GetRequiredService<MDCDbContext>();
        Assert.NotNull(dbContext);
        var dbDataCenters = await dbContext.Datacenters.ToArrayAsync();
        Assert.NotNull(dbDataCenters);
        Assert.NotEmpty(dbDataCenters);
        Assert.Single(dbDataCenters);
        
        var dbDatacenter = dbDataCenters.Single();
        Assert.Equal(dbDatacenter.Name, datacenter.Name);
        Assert.Equal(dbDatacenter.Description, datacenter.Description);
        Assert.Equal(dbDatacenter.Id, datacenter.Id);

        // Verify that the datacenter workspaces matches the database
        Assert.NotNull(datacenter.Workspaces);
        Assert.Equal(dbDatacenter.Workspaces.Select(i => new
        {
            i.Name,
            i.Id,
            i.Address,
            i.CreatedAt,
            i.UpdatedAt
        }),
        datacenter.Workspaces.Select(i => new
        {
            i.Name,
            i.Id,
            i.Address,
            i.CreatedAt,
            i.UpdatedAt
        }));

        // Verify the DatacenterSettings
        Assert.NotNull(datacenter.DatacenterSettings);

        // Verify the DatacenterNodes
        Assert.NotEmpty(datacenter.DatacenterNodes);
    }
}
