namespace MDC.Core.Services.Api;

/// <summary/>
public interface IDatacenterService
{
    /// <summary/>
    Task<string[]> GetDatacenterSitesAsync(CancellationToken cancellationToken = default);

    /// <summary/>
    Task<Datacenter> GetDatacenterAsync(string site, CancellationToken cancellationToken = default);

    /// <summary/>
    Task RepopulateDatabaseAsync(CancellationToken cancellationToken = default);

    /// <summary/>
    Task<Datacenter> RegisterDatacenterAsync(string site, CancellationToken cancellationToken = default);
}
