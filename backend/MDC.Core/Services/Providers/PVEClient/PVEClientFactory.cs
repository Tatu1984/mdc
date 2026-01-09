using MDC.Core.Services.Providers.ZeroTier;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MDC.Core.Services.Providers.PVEClient;

internal class PVEClientFactory(IZeroTierService zeroTierService) : IPVEClientFactory
{
    public async Task<IPVEClientService> CreateClientAsync(string site, CancellationToken cancellationToken = default)
    {
        var mdcEndpoints = await zeroTierService.GetMicroDataCenterEndpointsAsync(cancellationToken);

        var mdcEndpoint = mdcEndpoints.FirstOrDefault(e => e.PVEClientConfiguration.Site?.Equals(site, StringComparison.OrdinalIgnoreCase) == true || e.ZTMember?.Name?.Equals(site, StringComparison.OrdinalIgnoreCase) == true);
        if (mdcEndpoint == null)
        {
            throw new InvalidOperationException($"No MicroDataCenter endpoint found for site '{site}'.");
        }

        var uri = new Uri(mdcEndpoint.PVEClientConfiguration.BaseUrl.TrimEnd('/') + "/");
        // TODO: Validate that the URI Host matches the expected IP Address or hostname from the mdcEndpoint

        var handler = new HttpClientHandler();
        if (!mdcEndpoint.PVEClientConfiguration.ValidateServerCertificate)
        {
            handler.ServerCertificateCustomValidationCallback = (message, cert, chain, errors) => true;
        }
        var httpClient = new HttpClient(handler);
        httpClient.BaseAddress = uri;
        httpClient.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue(mdcEndpoint.PVEClientConfiguration.AuthenticationScheme, $"{mdcEndpoint.PVEClientConfiguration.TokenId}={mdcEndpoint.PVEClientConfiguration.Secret}");
        httpClient.DefaultRequestHeaders.Add("Accept", "application/json");
        if (mdcEndpoint.PVEClientConfiguration.Timeout.HasValue)
        {
            httpClient.Timeout = TimeSpan.FromSeconds(mdcEndpoint.PVEClientConfiguration.Timeout.Value);
        }

        return new PVEClientService(httpClient);
    }
}
