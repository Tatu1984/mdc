using Microsoft.OData.Edm;
using Microsoft.OData.ModelBuilder;
using System.Linq;

namespace MDC.Api
{
    internal class EdmModelBuilder
    {
        // Learn more about OData Model Builder: https://learn.microsoft.com/odata/webapi/model-builder-abstract
        public static IEdmModel GetEdmModel()
        {
            var builder = new ODataConventionModelBuilder();
            builder.EnableLowerCamelCase();
            builder.Namespace = "MDC.Shared.Models";

            builder.EntityType<Datacenter>();
            builder.Singleton<Datacenter>("Datacenter");
            builder.EntitySet<Workspace>("Workspaces");            
            builder.EntitySet<DeviceConfiguration>("DeviceConfigurations");



            //builder.EntitySet<Order>("Orders");

            //var customerType = builder.EntityType<Customer>();

            //// Define the Bound function to a single entity
            //customerType
            //    .Function("GetCustomerOrdersTotalAmount")
            //    .Returns<int>();

            //// Define theBound function to collection
            //customerType
            //    .Collection
            //    .Function("GetCustomerByName")
            //    .ReturnsFromEntitySet<Customer>("Customers")
            //    .Parameter<string>("name");

            return builder.GetEdmModel();
        }
    }
}