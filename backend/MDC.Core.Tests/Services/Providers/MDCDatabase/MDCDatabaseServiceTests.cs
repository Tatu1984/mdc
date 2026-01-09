using MDC.Core.Services.Providers.MDCDatabase;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MDC.Core.Tests.Services.Providers.MDCDatabase;

public class MDCDatabaseServiceTests : BaseServicesTests
{
    private class TestMDCDbContext(IConfiguration configuration) : MDCDbContext(configuration)
    {
        // This is a test context that uses an in-memory database for testing purposes.
        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            if (optionsBuilder.IsConfigured)
            {
                return;
            }
            optionsBuilder.UseInMemoryDatabase("MDC");
        }
    }

    [Fact]
    public async Task RecreateDatabaseAsync_ShouldCreateDatabase()
    {
        // Arrange
        IServiceCollection serviceDescriptors = new ServiceCollection();
        serviceDescriptors.AddDbContext<MDCDbContext, TestMDCDbContext>();
        
        using IServiceScope serviceScope = AssembleServicesTest(serviceDescriptors, new ConfigurationManager());
        var service = serviceScope.ServiceProvider.GetRequiredService<IMDCDatabaseService>();
        var context = serviceScope.ServiceProvider.GetRequiredService<MDCDbContext>();
        Assert.True(context.Database.IsInMemory(), "The database should be an in-memory database for testing purposes.");

        // Act
        await service.RecreateDatabaseAsync();

        // Assert
        var datacenters = await context.Datacenters.ToListAsync();
        Assert.Empty(datacenters);
    }
}
