using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.OData;
using Microsoft.AspNetCore.OData.Batch;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.OpenApi.Models;
using Scalar.AspNetCore;
using MDC.Core.Extensions;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using MDC.Api.Services.Authentication;
using Microsoft.AspNetCore.Authentication;

namespace MDC.Api
{
    /// <summary>
    /// The entry point of the application. Configures and starts the web application with OData, Swagger/OpenAPI/ScalarUI, and
    /// other services.
    /// </summary>
    /// <remarks>This method initializes the application by setting up services, middleware, and routing. It
    /// configures OData with query features,  batch handling, and case-insensitive routing options. Swagger/OpenAPI is
    /// also configured for API documentation and debugging.  In development environments, additional debugging tools
    /// such as OData route debugging and Swagger UI are enabled.</remarks>
    public class Program
    {
        /// <summary>
        /// The entry point of the application. Configures and starts the web application with OData, Swagger/OpenAPI/ScalarUI,
        /// and other services.
        /// </summary>
        /// <remarks>This method initializes the application by setting up services, middleware, and
        /// routing. It configures OData with query features,  batch handling, and case-insensitive routing options.
        /// Swagger/OpenAPI is also configured for API documentation and exploration.  In development environments,
        /// additional debugging tools such as OData route debugging and Swagger UI are enabled.</remarks>
        /// <param name="args">An array of command-line arguments passed to the application.</param>
        public static async Task Main(string[] args)
        {
            // Learn more about configuring OData at https://learn.microsoft.com/odata/webapi-8/getting-started
            var builder = WebApplication.CreateBuilder(args);
            
            builder.Services.AddMicroDatacenterCore(builder.Configuration);
            builder.Configuration.AddUserSecrets<Program>();
            
            // Register API Key Authentication services
            builder.Services.AddScoped<IAPIKeyAuthenticationService, APIKeyAuthenticationService>();
            
            builder.Services.AddControllers()
                .AddOData(opt =>
                {
                    DefaultODataBatchHandler defaultBatchHandler = new DefaultODataBatchHandler();
                    defaultBatchHandler.MessageQuotas.MaxNestingDepth = 2;
                    defaultBatchHandler.MessageQuotas.MaxOperationsPerChangeset = 10;
                    defaultBatchHandler.MessageQuotas.MaxReceivedMessageSize = 100;

                    opt.AddRouteComponents(
                            routePrefix: "odata",
                            model: EdmModelBuilder.GetEdmModel(),
                            batchHandler: defaultBatchHandler)
                        .EnableQueryFeatures(100);

                    opt.RouteOptions.EnableControllerNameCaseInsensitive = true;
                    opt.RouteOptions.EnableActionNameCaseInsensitive = true;
                    opt.RouteOptions.EnablePropertyNameCaseInsensitive = true;
                    opt.RouteOptions.EnableNonParenthesisForEmptyParameterFunction = true;
                })
                .AddJsonOptions(options =>
                {
                    options.JsonSerializerOptions.DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull;
                    options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
                });

            // Learn more about configuring Swagger/OpenAPI at https://github.com/OData/AspNetCoreOData/tree/main/sample/ODataRoutingSample
            builder.Services.AddEndpointsApiExplorer();
            
            // Configure Authentication
            var keycloakAuthServerUrl = builder.Configuration["KEYCLOAK_AUTH_SERVER_URL"];
            var keycloakRealm = builder.Configuration["KEYCLOAK_REALM"];
            
            builder.Services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(JwtBearerDefaults.AuthenticationScheme, options =>
            {
                options.Authority = $"{keycloakAuthServerUrl}/realms/{keycloakRealm}";
                options.Audience = builder.Configuration["KEYCLOAK_RESOURCE"];
                options.RequireHttpsMetadata = false; // For development
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidIssuer = builder.Configuration["KEYCLOAK_ISSUER"],
                    ValidateAudience = builder.Configuration.GetValue<bool>("KEYCLOAK_VERIFY_TOKEN_AUDIENCE", true),
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ClockSkew = TimeSpan.FromMinutes(5),
                    RoleClaimType = "realm_access.roles"
                };
            })
            .AddScheme<ApiKeyAuthenticationSchemeOptions, ApiKeyAuthenticationHandler>("ApiKey", options => { });
            
            builder.Services.AddTransient<IClaimsTransformation, KeycloakRoles>();

            builder.Services.AddAuthorization(options =>
            {
                // Define authorization policies
                options.AddPolicy("GlobalAdministrator", policy =>  policy.RequireRole(UserRoles.GlobalAdministrator));
                options.AddPolicy("DatacenterTechnician", policy => policy.RequireRole(UserRoles.GlobalAdministrator, UserRoles.DatacenterTechnician));
                options.AddPolicy("WorkspaceManager", policy => policy.RequireRole(UserRoles.GlobalAdministrator, UserRoles.DatacenterTechnician, UserRoles.WorkspaceManager));
                options.AddPolicy("WorkspaceTenant", policy => policy.RequireRole(UserRoles.GlobalAdministrator, UserRoles.DatacenterTechnician, UserRoles.WorkspaceManager, UserRoles.WorkspaceTenant));
            });

            builder.Services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new OpenApiInfo { Title = "MDC.Api", Version = "v1" });
                // c.SchemaFilter<DeltaSchemaFilter<WorkspaceDescriptor>>();

                // Add JWT Bearer authentication to Swagger
                c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
                {
                    Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
                    Name = "Authorization",
                    In = ParameterLocation.Header,
                    Type = SecuritySchemeType.ApiKey,
                    Scheme = "Bearer"
                });

                // Add API Key authentication to Swagger
                c.AddSecurityDefinition("ApiKey", new OpenApiSecurityScheme
                {
                    Description = "API Key authentication. Use X-API-Key header or apikey query parameter.",
                    Name = "X-API-Key",
                    In = ParameterLocation.Header,
                    Type = SecuritySchemeType.ApiKey
                });

                c.AddSecurityRequirement(new OpenApiSecurityRequirement
                {
                    {
                        new OpenApiSecurityScheme
                        {
                            Reference = new OpenApiReference
                            {
                                Type = ReferenceType.SecurityScheme,
                                Id = "Bearer"
                            }
                        },
                        Array.Empty<string>()
                    },
                    {
                        new OpenApiSecurityScheme
                        {
                            Reference = new OpenApiReference
                            {
                                Type = ReferenceType.SecurityScheme,
                                Id = "ApiKey"
                            }
                        },
                        Array.Empty<string>()
                    }
                });
            });

            // OpenAPI
            builder.Services.AddOpenApi();

            // Configure CORS
            var webOrigins = builder.Configuration.GetSection("CORS:AllowedOrigins").Get<string[]>() ?? new[]
            {
                "http://localhost:3000",           // Local development
            };

            builder.Services.AddCors(options =>
            {
                options.AddPolicy("MDCWebPolicy", policy =>
                {
                    policy
                        .WithOrigins(webOrigins)
                        .AllowAnyMethod()
                        .AllowAnyHeader()
                        .AllowCredentials();
                });

                // More permissive policy for development
                options.AddPolicy("DevelopmentPolicy", policy =>
                {
                    policy
                        .AllowAnyOrigin()
                        .AllowAnyMethod()
                        .AllowAnyHeader();
                });
            });

            var app = builder.Build();

            using (var scope = app.Services.CreateScope())
            {
                // Apply database migrations
                await scope.UseMicroDatacenterMigrationsAsync();
            }
            
            app.UseODataBatching();

            //app.UseHttpsRedirection();
            
            // Configure CORS middleware
            if (app.Environment.IsDevelopment())
            {
                app.UseCors("DevelopmentPolicy");
            }
            else
            {
                app.UseCors("MDCWebPolicy");
            }
            
            app.UseAuthentication();
            app.UseAuthorization();

            //if (app.Environment.IsDevelopment())
            {
                app.UseODataRouteDebug();
                app.UseSwagger();
                app.UseSwaggerUI(c =>
                {
                    // c.EnablePersistAuthorization();
                    //c.SupportedSubmitMethods(new Swashbuckle.AspNetCore.SwaggerUI.SubmitMethod[] { });
                    c.SwaggerEndpoint("/swagger/v1/swagger.json", "MDC.Api V1");
                });

                // Scalar
                app.MapScalarApiReference();
            }

            // OpenAPI
            app.MapOpenApi();

            // Health check endpoint
            app.MapGet("/health", () => new { status = "healthy", timestamp = DateTime.UtcNow });

            // app.UseRouting();

            app.MapControllers();

            await app.RunAsync();
        }
    }
}
