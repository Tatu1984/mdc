using MDC.Core.Extensions;
using MDC.Core.Tests;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.VisualStudio.TestPlatform.Utilities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using Xunit.Sdk;

namespace MDC.Integration.Tests;
 
public abstract class BaseIntegrationTests : BaseServicesTests
{
    /*
     * secrets.json file is used to load the configuration.
     * It should have the following structure such that each theory can override the configuration for testing against different environments.
     
{
    "theory": {
        "<theoryConfigurationKey>": {
            "PVEClientService": {
                "baseUrl": "https://<ProxMox Address>:8006/api2/json/",
                "authenticationScheme": "PVEAPIToken",
                "tokenId": "<API Access Token>",
                "secret": "<API Access Token Secret>",
                "validateServerCertificate": false
            },
            "ConnectionStrings": {
                "DefaultConnection": "Host=<Database Address>;Port=5432;Database=MDC;Username=postgres;Password=<Database Password>"
            }
        }
    }
}
     */
    public class TheoryConfigurationKeys : TheoryData<string>
    {
        public TheoryConfigurationKeys()
        {
            ConfigurationManager configurationManager = new ConfigurationManager();
            configurationManager.AddUserSecrets(Assembly.GetExecutingAssembly());
            foreach (var section in configurationManager.GetSection("theory").GetChildren())
            {
                Add(section.Key);
            }
        }
    }

    internal IServiceScope AssembleIntegrationTest(IServiceCollection serviceDescriptors, string? theoryConfigurationKey)
    {
        if (!System.Diagnostics.Debugger.IsAttached)
        {
            throw SkipException.ForSkip("Integration Tests require debugger to be attached");
        }
        ConfigurationBuilder configurationBuilder = new ConfigurationBuilder();
        configurationBuilder.AddUserSecrets(Assembly.GetExecutingAssembly());

        var configuration = configurationBuilder.Build();
        Assert.NotNull(configuration);

        // Add an override configuration from the appsettings.json file
        if (theoryConfigurationKey != null)
        {
            ConfigurationBuilder overrideConfigurationBuilder = new ConfigurationBuilder();
            overrideConfigurationBuilder.AddConfiguration(configuration);

            var prefix = $"theory:{theoryConfigurationKey}";
            var overrideSection = configuration.GetRequiredSection(prefix);
            Assert.NotNull(overrideSection);

            // Copy all of the children of the override section to the configuration builder
            var children = overrideSection
                .GetChildren()
                .SelectMany(child => child.AsEnumerable(), (section, entry) => new KeyValuePair<string, string?>(entry.Key.Remove(0, prefix.Length + 1), entry.Value))
                .ToArray();
            Assert.NotNull(children);

            overrideConfigurationBuilder.AddInMemoryCollection(children);
    
            configuration = overrideConfigurationBuilder.Build();
        }

        return AssembleServicesTest(serviceDescriptors, configuration);
    }
}
