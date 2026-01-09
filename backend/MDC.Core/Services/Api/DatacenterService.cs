using MDC.Core.Models;
using MDC.Core.Services.Providers.MDCDatabase;
using MDC.Core.Services.Providers.PVEClient;
using MDC.Core.Services.Providers.ZeroTier;

namespace MDC.Core.Services.Api;

internal class DatacenterService(IMDCDatabaseService databaseService, IServiceProvider serviceCollection) : IDatacenterService
{
    public async Task<string[]> GetDatacenterSitesAsync(CancellationToken cancellationToken = default)
    {
        var zeroTierService = serviceCollection.GetRequiredService<IZeroTierService>();
        var mdcEndpoints = await zeroTierService.GetMicroDataCenterEndpointsAsync();
        return mdcEndpoints.Select(i => i.ZTMember.Name).ToArray();
    }

    public async Task<Datacenter> GetDatacenterAsync(string site, CancellationToken cancellationToken = default)
    {
        var pveClientFactory = serviceCollection.GetRequiredService<IPVEClientFactory>();
        var pveClient = await pveClientFactory.CreateClientAsync(site, cancellationToken);

        var datacenterEntry = await DatacenterFactory.GetDatacenterEntryAsync(site, pveClient, databaseService, false, cancellationToken);

        return DatacenterFactory.ToDatacenter(datacenterEntry);
    }

    public async Task RepopulateDatabaseAsync(CancellationToken cancellationToken = default)
    {
        // Ensure the database exists and is migrated
        await databaseService.RecreateDatabaseAsync(cancellationToken);

        //var clusterStatus = await pveClient.GetClusterStatusAsync(cancellationToken);
        //var datacenterNode = DatacenterFactory.GetDatacenterCluster(clusterStatus);

        //// Create the Datacenter
        //var dbDatacenter = await databaseService.CreateDatacenterAsync(datacenterNode.Name, string.Empty, cancellationToken);

        //// Create the Workspaces
        //var datacenterEntry = await settings.GetDatacenterEntryAsync(true, cancellationToken);

        ////var pveResources = await pveClient.GetClusterResourcesAsync(cancellationToken);
        ////var datacenterEntry = pveResources.ToDatacenterEntry(dbDatacenter, datacenterNode, true);

        //var dbCreatedWorkspaces = await databaseService.ImportWorkspacesAsync(dbDatacenter.Id, datacenterEntry.Workspaces, cancellationToken);

        //// Create Virtual Networks in the database
        //var dbCreatedVirtualNetworks = await databaseService.ImportVirtualNetworksAsync(datacenterEntry.Workspaces, cancellationToken);
    }

    public async Task<Datacenter> RegisterDatacenterAsync(string site, CancellationToken cancellationToken = default)
    {
        var pveClientFactory = serviceCollection.GetRequiredService<IPVEClientFactory>();
        var pveClient = await pveClientFactory.CreateClientAsync(site, cancellationToken);

        var clusterStatus = await pveClient.GetClusterStatusAsync(cancellationToken);
        var datacenterNode = DatacenterFactory.GetDatacenterCluster(clusterStatus);

        if (site != datacenterNode.Name)
        {
            throw new InvalidOperationException($"Datacenter with name '{datacenterNode.Name}' does not match the requested site '{site}'.");
        }

        // Create the Datacenter
        var dbDatacenter = await databaseService.CreateDatacenterAsync(datacenterNode.Name, string.Empty, cancellationToken);

        // Create the Workspaces
        var datacenterEntry = await DatacenterFactory.GetDatacenterEntryAsync(site, pveClient, databaseService,true, cancellationToken);

        //var pveResources = await pveClient.GetClusterResourcesAsync(cancellationToken);
        //var datacenterEntry = pveResources.ToDatacenterEntry(dbDatacenter, datacenterNode, true);

        var dbCreatedWorkspaces = await databaseService.ImportWorkspacesAsync(dbDatacenter.Id, datacenterEntry.Workspaces, cancellationToken);

        // Create Virtual Networks in the database
        var dbCreatedVirtualNetworks = await databaseService.ImportVirtualNetworksAsync(datacenterEntry.Workspaces, cancellationToken);

   //      await RepopulateDatabaseAsync(cancellationToken);
        return await GetDatacenterAsync(site, cancellationToken);
    }
}
