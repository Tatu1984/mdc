using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MDC.Core.Services.Providers.MDCDatabase;

/*
 * When modifying database schema, b sure to add a new migration using the following command in Package Manager Console: 
 *  add-migration <Migration Name> -Project "MDC.Core"
 * 
 */

internal class DatabaseMigrationService(MDCDbContext context, ILogger<DatabaseMigrationService> logger) : IDatabaseMigrationService
{
    public async Task<bool> MigrateAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            logger.LogInformation("Starting database migration...");

            if (context.Database.IsInMemory())
            {
                logger.LogInformation("Ensuring InMemory Database is created");
                await context.Database.EnsureCreatedAsync(cancellationToken);
                return true;
            }

            var pendingMigrations = await context.Database.GetPendingMigrationsAsync(cancellationToken);
            if (pendingMigrations.Any())
            {
                logger.LogInformation("Found {Count} pending migrations: {Migrations}",
                    pendingMigrations.Count(), string.Join(", ", pendingMigrations));

                await context.Database.MigrateAsync(cancellationToken);
                logger.LogInformation("Database migration completed successfully");
                return true; // Migrations were applied
            }
            else
            {
                // Check if database tables exist - if not, use EnsureCreated for initial setup
                var canConnect = await context.Database.CanConnectAsync(cancellationToken);
                if (canConnect)
                {
                    try
                    {
                        // Try to query a table to see if schema exists
                        _ = await context.Datacenters.AnyAsync(cancellationToken);
                        logger.LogInformation("Database is already up to date");
                    }
                    catch
                    {
                        // Tables don't exist, create them
                        logger.LogInformation("No migrations found, creating database schema...");
                        await context.Database.EnsureCreatedAsync(cancellationToken);
                        logger.LogInformation("Database schema created successfully");
                        return true;
                    }
                }
                return false; // No migrations were applied
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to migrate database");
            throw;
        }
    }
    
    public async Task<IEnumerable<string>> GetPendingMigrationsAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            return await context.Database.GetPendingMigrationsAsync(cancellationToken);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to get pending migrations");
            throw;
        }
    }
    
    public async Task<bool> IsNewDatabaseAsync(CancellationToken cancellationToken)
    {
        try
        {
            // Check if the database exists and has tables
            var canConnect = await context.Database.CanConnectAsync(cancellationToken);
            if (!canConnect)
            {
                return true;
            }

            try
            {
                // Try to query a table to see if schema exists
                _ = await context.Datacenters.AnyAsync(cancellationToken);
                return false; // Tables exist, not a new database
            }
            catch
            {
                return true; // Tables don't exist, it's a new database
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to check if database is new");
            throw;
        }
    }
}