using MDC.Core.Extensions;
using MDC.Shared.Tests;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MDC.Core.Tests;

public class BaseServicesTests : BaseSharedTests
{
    /*
     * This method assembles the service collection and creates a service scope.
     */

    protected IServiceScope AssembleServicesTest(IServiceCollection serviceDescriptors, IConfiguration configuration)
    {
        serviceDescriptors.AddMicroDatacenterCore(configuration);

        // Add any additional services required for the tests here.
        // TODO:
        //      If IOptions<PVEClientServiceOptions> is not registered, it will throw an exception when trying to resolve IPVEClientService.
        //      If Typed HttpClient for PVEClientServiceOptions is not registered, it will throw an exception when trying to resolve IPVEClientService.
        //      Add mocked services or use a test configuration to avoid these issues.

        return AssembleSharedTest(serviceDescriptors);
    }
}
