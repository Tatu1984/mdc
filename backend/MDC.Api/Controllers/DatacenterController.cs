using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Xml.Linq;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OData.Deltas;
using Microsoft.AspNetCore.OData.Formatter;
using Microsoft.AspNetCore.OData.Query;
using Microsoft.AspNetCore.OData.Routing.Controllers;
using Microsoft.Extensions.Logging;

namespace MDC.Api.Controllers;

/// <summary>
/// Provides OData API endpoints for managing and querying datacenter-related resources.
/// </summary>
/// <remarks>This controller supports OData queries and adheres to default API conventions for HTTP
/// methods. Use this controller to retrieve, update, or manipulate datacenter-related data via OData-compliant
/// endpoints.</remarks>
//[ApiController]
[Authorize(AuthenticationSchemes = "Bearer,ApiKey")]
public class DatacenterController(IDatacenterService datacenterService, ILogger<DatacenterController> logger) : ODataController
{
    /// <summary>
    /// 
    /// </summary>
    /// <param name="cancellationToken"></param>
    /// <returns></returns>
    [Authorize(Policy = "WorkspaceTenant")]
    public async Task<IActionResult> GetDatacenterSitesAsync(CancellationToken cancellationToken)
    {
        logger.LogDebug("Fetching datacenter sites.");
        return Ok(await datacenterService.GetDatacenterSitesAsync(cancellationToken));
    }

    /// <summary>
    /// Gets datacenter information.
    /// </summary>
    /// <returns></returns>
    // GET: odata/Datacenter
    // [EnableQuery(PageSize = 10)]
    //[HttpGet("odata/Datacenter")]
    //[ApiConventionMethod(typeof(DefaultApiConventions),
    //             nameof(DefaultApiConventions.Get))]
    [Authorize(Policy = "WorkspaceTenant")]
    public async Task<IActionResult> GetDatacenterAsync(string site, CancellationToken cancellationToken)
    {
        logger.LogDebug("Fetching datacenter settings.");
        return Ok(await datacenterService.GetDatacenterAsync(site, cancellationToken));
    }
}
