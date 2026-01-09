using MDC.Core.Services.Providers.PVEClient;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;

namespace MDC.Core.Services.Providers.ZeroTier;

internal class MicroDataCenterEndpoint
{
    public required PVEClientServiceOptions PVEClientConfiguration;

    public required IPAddress IPAddress;

    public required ZTMember ZTMember;
}
