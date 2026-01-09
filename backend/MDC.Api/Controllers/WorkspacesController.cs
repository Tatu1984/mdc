using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OData.Query;
using Microsoft.AspNetCore.OData.Routing.Controllers;
using Microsoft.Extensions.Logging;
using System.Text.Json.Nodes;

namespace MDC.Api.Controllers
{
    /// <summary>
    /// 
    /// </summary>
    /// <param name="workspaceService"></param>
    /// <param name="logger"></param>
    [ApiController]
    public class WorkspacesController(IWorkspaceService workspaceService, ILogger<WorkspacesController> logger) : ODataController
    {
        /// <summary>
        /// 
        /// </summary>
        /// <param name="site"></param>
        /// <param name="cancellationToken"></param>
        /// <returns></returns>
        // GET: odata/Workspaces
        [EnableQuery(PageSize = 10)]
        [HttpGet("odata/{site}/Workspaces")]
        [ApiConventionMethod(typeof(DefaultApiConventions),
                     nameof(DefaultApiConventions.Get))]
        public async Task<IActionResult> AllAsync([FromRoute] string site, CancellationToken cancellationToken = default)
        {
            logger.LogDebug("Fetching all Workspaces.");
            return Ok(await workspaceService.GetAllAsync(site, cancellationToken));
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="site"></param>
        /// <param name="key"></param>
        /// <param name="cancellationToken"></param>
        /// <returns></returns>
        // GET: odata/Workspaces(1)
        [EnableQuery]
        [HttpGet("odata/{site}/Workspaces({key})")]
        [ApiConventionMethod(typeof(DefaultApiConventions),
                     nameof(DefaultApiConventions.Get))]
        public async Task<IActionResult> SingleAsync([FromRoute] string site, [FromRoute] Guid key, CancellationToken cancellationToken = default)
        {
            var item = await workspaceService.GetByIdAsync(site, key, cancellationToken);
            if (item == null)
            {
                return NotFound("Workspace not found.");
            }

            return Ok(item);
        }

        ///// <summary>
        ///// 
        ///// </summary>
        ///// <param name="address"></param>
        ///// <returns></returns>
        //// GET: odata/Workspaces/GetByAddress(address='0100')
        //[EnableQuery]
        //[HttpGet("odata/Workspaces/GetByAddress(address={address})")]
        //[ApiConventionMethod(typeof(DefaultApiConventions),
        //             nameof(DefaultApiConventions.Get))]
        //public async Task<IActionResult> FetchByAddressAsync([FromRoute] int address)
        //{
        //    var item = await workspaceService.GetByAddressAsync(address);
        //    if (item == null)
        //    {
        //        return NotFound("Workspace not found.");
        //    }

        //    return Ok(item);
        //}

        /// <summary>
        /// 
        /// </summary>
        /// <param name="site"></param>
        /// <param name="workspace"></param>
        /// <param name="cancellationToken"></param>
        /// <returns></returns>
        // POST: odata/Workspaces
        [HttpPost("odata/{site}/Workspaces")]
        [ApiConventionMethod(typeof(DefaultApiConventions),
                     nameof(DefaultApiConventions.Post))]
        public async Task<IActionResult> AddAsync([FromRoute] string site, [FromBody] WorkspaceDescriptor workspace, CancellationToken cancellationToken = default)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            return Created(await workspaceService.CreateAsync(site, workspace, cancellationToken));
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="site"></param>
        /// <param name="key"></param>
        /// <param name="delta"></param>
        /// <param name="cancellationToken"></param>
        /// <returns></returns>
        // PATCH odata/Workspaces/1
        [HttpPatch("odata/{site}/Workspaces({key})")]
        [ApiConventionMethod(typeof(DefaultApiConventions),
                     nameof(DefaultApiConventions.Update))]
        public async Task<IActionResult> UpdateAsync([FromRoute] string site, [FromRoute] Guid key, [FromBody] JsonNode delta, CancellationToken cancellationToken = default)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            
            return Updated(await workspaceService.UpdateAsync(site, key, delta, cancellationToken));
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="site"></param>
        /// <param name="key"></param>
        /// <returns></returns>
        // DELETE odata/Workspaces/1
        [HttpDelete("odata/{site}/Workspaces({key})")]
        [ApiConventionMethod(typeof(DefaultApiConventions),
                     nameof(DefaultApiConventions.Delete))]
        public async Task<IActionResult> RemoveAsync([FromRoute] string site, [FromRoute] Guid key)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            await workspaceService.DeleteAsync(site, key);
            return NoContent();
        }


        ///// <summary>
        ///// 
        ///// </summary>
        ///// <param name="key"></param>
        ///// <returns></returns>
        //// GET: odata/Customers(1)/GetCustomerOrdersTotalAmount
        //[EnableQuery]
        //[HttpGet("odata/Customers({key})/GetCustomerOrdersTotalAmount")]
        //[ApiConventionMethod(typeof(DefaultApiConventions),
        //             nameof(DefaultApiConventions.Get))]
        //public IActionResult CalculateCustomerOrdersTotalAmount([FromRoute] int key)
        //{
        //    var customer = _customers.FirstOrDefault(c => c.Id == key);
        //    if (customer == null)
        //    {
        //        return NotFound("Customer not found.");
        //    }

        //    return Ok(customer.Orders.Sum(o => o.Amount));
        //}
    }
}
