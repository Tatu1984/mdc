using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MDC.Core.Services.Providers.PVEClient;

internal interface IPVEClientFactory
{
    Task<IPVEClientService> CreateClientAsync(string site, CancellationToken cancellationToken = default);
}
