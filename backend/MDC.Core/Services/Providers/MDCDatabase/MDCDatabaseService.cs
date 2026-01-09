using MDC.Core.Models;
using MDC.Shared.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using System.Formats.Asn1;
using System.Net.NetworkInformation;

namespace MDC.Core.Services.Providers.MDCDatabase;

internal class MDCDatabaseService(MDCDbContext dbContext, IDatabaseMigrationService migrationService) : IMDCDatabaseService
{
    public async Task RecreateDatabaseAsync(CancellationToken cancellationToken = default)
    {
        // NOTE:  Do not delete the database - when using Azure SQL, this will partially remove the database from Azure subscription
        // ***** DO NOT DELETE DATABASE **** await dbContext.Database.EnsureDeletedAsync(cancellationToken);

        // Apply all migrations to create the database with proper schema
        await migrationService.MigrateAsync(cancellationToken);
    }

    public async Task<DbDatacenter> CreateDatacenterAsync(string name, string description, CancellationToken cancellationToken = default)
    {
        var existing = await dbContext.Datacenters.FirstOrDefaultAsync(i => i.Name == name, cancellationToken);
        if (existing != null) return existing;

        var now = DateTime.UtcNow;
        var dbDatacenter = await dbContext.Datacenters.AddAsync(new DbDatacenter
        {
            Name = name,
            Description = description,
            CreatedAt = now,
            UpdatedAt = now
        }, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);
        return dbDatacenter.Entity;
    }

    public async Task<DbWorkspace[]> GetAllWorkspacesAsync(CancellationToken cancellationToken = default)
    {
        // This method should return all workspaces from the database
        return await dbContext.Workspaces.ToArrayAsync(cancellationToken);
    }

    public async Task<DbWorkspace[]> ImportWorkspacesAsync(Guid datacenterId, IEnumerable<WorkspaceEntry> workspaceEntries, CancellationToken cancellationToken = default)
    {
        var existing = await dbContext.Workspaces
            .Where(i => i.DatacenterId == datacenterId)
            .Select(i => i.Address)
            .ToArrayAsync(cancellationToken);
        
        var now = DateTime.UtcNow;
        var dbWorkspaces = workspaceEntries
            .Where(entry => entry.DbWorkspace == null && entry.Address != 0 && !string.IsNullOrEmpty(entry.Name) && !existing.Contains(entry.Address))
            .Select(entry => entry.DbWorkspace = new DbWorkspace
            {
                DatacenterId = datacenterId,
                Address = entry.Address,
                Name = entry.Name,
                CreatedAt = now,
                UpdatedAt = now,
                Status = null
            })
            .ToArray();

        if (dbWorkspaces.Length == 0) return Array.Empty<DbWorkspace>();

        await dbContext.Workspaces.AddRangeAsync(dbWorkspaces, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);
        return dbWorkspaces.ToArray();
    }

    public async Task<DbDatacenter?> GetDatacenterByNameAsync(string name, CancellationToken cancellationToken = default)
    {
        // This method should return a datacenter by its name
        return await dbContext.Datacenters
            .Include(dc => dc.Workspaces)
            .ThenInclude(ws => ws.VirtualNetworks)
            .FirstOrDefaultAsync(dc => dc.Name == name, cancellationToken);
    }

    //public async Task<DbVirtualNetwork[]> ImportVirtualNetworksAsync(Guid workspaceId, IEnumerable<VirtualNetworkEntry> virtualNetworkEntries, CancellationToken cancellationToken = default)
    //{
    //    var now = DateTime.UtcNow;
    //    var dbVirtualNetworks = virtualNetworkEntries
    //        .Where(entry => entry.DbVirtualNetwork == null && entry.Index.HasValue && entry.Name != null && entry.Tag.HasValue)
    //        .Select(entry => entry.DbVirtualNetwork = new DbVirtualNetwork
    //        {
    //            WorkspaceId = workspaceId,
    //            Index = entry.Index!.Value,
    //            Name = entry.Name!,
    //            Tag = entry.Tag!.Value,
    //            CreatedAt = now,
    //            UpdatedAt = now,
    //            ZeroTierNetworkId = null
    //        })
    //        .ToArray();
    //    await dbContext.VirtualNetworks.AddRangeAsync(dbVirtualNetworks, cancellationToken);
    //    await dbContext.SaveChangesAsync(cancellationToken);
    //    return dbVirtualNetworks;
    //}

    public async Task<DbVirtualNetwork[]> ImportVirtualNetworksAsync(IEnumerable<WorkspaceEntry> workspaceEntries, CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        var dbVirtualNetworks = workspaceEntries.Where(i => i.DbWorkspace != null)
            .SelectMany(we => we.VirtualNetworks.Where(i => i.DbVirtualNetwork == null && i.Index.HasValue && i.Name != null && i.Tag.HasValue), 
                (we,vn) => new
                    {
                        WorkspaceEntry = we,
                        VirtualNetworkEntry = vn
                    }
            )
            .Select(i =>
                i.VirtualNetworkEntry.DbVirtualNetwork = new DbVirtualNetwork
                {
                    WorkspaceId = i.WorkspaceEntry.DbWorkspace!.Id,
                    Index = i.VirtualNetworkEntry.Index!.Value,
                    Name = i.VirtualNetworkEntry.Name!,
                    Tag = i.VirtualNetworkEntry.Tag!.Value,
                    CreatedAt = now,
                    UpdatedAt = now,
                    ZeroTierNetworkId = null
                }
            )
            .ToArray();

        var existing = await dbContext.VirtualNetworks
            .Where(i => dbVirtualNetworks.Select(vn => vn.WorkspaceId).Contains(i.WorkspaceId))
            .Select(i => new { i.WorkspaceId, i.Tag })
            .ToListAsync(cancellationToken);

        var updateDbVirtualNetworks = dbVirtualNetworks
            .Where(vn => !existing.Any(e => e.WorkspaceId == vn.WorkspaceId && e.Tag == vn.Tag))
            .ToArray();

        if (updateDbVirtualNetworks.Length == 0) return Array.Empty<DbVirtualNetwork>();

        await dbContext.VirtualNetworks.AddRangeAsync(updateDbVirtualNetworks, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);
        return dbVirtualNetworks;
    }

    public async Task<DbWorkspace?> GetWorkspaceByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await dbContext.Workspaces
            .Include(i => i.Datacenter)
            .Include(i => i.VirtualNetworks)
            .FirstOrDefaultAsync(i => i.Id == id, cancellationToken);
    }

    public async Task<DbWorkspace> CreateWorkspaceAsync(DatacenterEntry datacenterEntry, string workspaceName, string[] virtualNetworkNames, CancellationToken cancellationToken = default)
    {
        using var transaction = await dbContext.Database.BeginTransactionAsync(System.Data.IsolationLevel.Serializable, cancellationToken);
        try
        {
            // Compute Next Available Address
            var exisingAddresses = await dbContext.Workspaces.Where(i => i.DatacenterId == datacenterEntry.DbDatacenter.Id).Select(i => i.Address).ToArrayAsync(cancellationToken);
            if (exisingAddresses.Length >= (9999 - datacenterEntry.DatacenterSettings.MinWorkspaceAddress)) throw new InvalidOperationException("Unable to create new Workspace.  Maximum number of Workspaces has been reached.");

            var existingTags = await dbContext.VirtualNetworks.Where(i => i.Workspace!.DatacenterId == datacenterEntry.DbDatacenter.Id).Select(i => i.Tag).ToListAsync(cancellationToken);
            if (existingTags.Count >= (4096 - datacenterEntry.DatacenterSettings.MinVirtualNetworkTag - virtualNetworkNames.Length)) throw new InvalidOperationException("Unable to create new Workspace.  Maximum number of Virtual Networks has been reached.");

            var now = DateTime.UtcNow;
            var dbWorkspace = new DbWorkspace
            {
                DatacenterId = datacenterEntry.DbDatacenter.Id,
                Address = Enumerable.Range(datacenterEntry.DatacenterSettings.MinWorkspaceAddress, exisingAddresses.Length + 1).Except(exisingAddresses).First(),  // The lowest Address available
                Name = workspaceName,
                CreatedAt = now,
                UpdatedAt = now,
                Status = "Creating"
            };
            var newWorkspace = await dbContext.Workspaces.AddAsync(dbWorkspace, cancellationToken);

            for (int index = 0; index < virtualNetworkNames.Length; index++)
            {
                var dbVirtualNetwork = new DbVirtualNetwork
                {
                    Index = index,
                    Tag = Enumerable.Range(datacenterEntry.DatacenterSettings.MinVirtualNetworkTag, existingTags.Count + 1).Except(existingTags).First(),  // The lowest Address Tag
                    Name = virtualNetworkNames[index],
                    CreatedAt = now,
                    UpdatedAt = now,
                    WorkspaceId = newWorkspace.Entity.Id,
                    Workspace = newWorkspace.Entity,
                    ZeroTierNetworkId = null
                };
                var newVirtualNetwork = await dbContext.VirtualNetworks.AddAsync(dbVirtualNetwork, cancellationToken);
                existingTags.Add(dbVirtualNetwork.Tag);
            }

            await dbContext.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);

            return newWorkspace.Entity;
        }
        catch (Exception)
        {
            // TODO: Log this exception
            await transaction.RollbackAsync(cancellationToken);
            throw;
        }
    }

    public async Task<DbWorkspace> UpdateWorkspaceAsync(DatacenterEntry datacenterEntry, Guid workspaceId, WorkspaceDescriptor workspaceDescriptor, CancellationToken cancellationToken = default)
    {
        using var transaction = await dbContext.Database.BeginTransactionAsync(System.Data.IsolationLevel.Serializable, cancellationToken);
        try
        {
            var dbWorkspace = await dbContext.Workspaces
                .Include(i => i.VirtualNetworks)
                .FirstOrDefaultAsync(i => i.Id == workspaceId && i.DatacenterId == datacenterEntry.DbDatacenter.Id, cancellationToken)
                ?? throw new InvalidOperationException($"Workspace '{workspaceId}' not found in database.");

            var now = DateTime.UtcNow;

            if (dbWorkspace.Name != workspaceDescriptor.Name)
            {
                dbWorkspace.Name = workspaceDescriptor.Name;
                dbWorkspace.UpdatedAt = now;
            }

            // First, process all of the Virtual Network deletions
            foreach (var virtualNetworkDescriptor in (workspaceDescriptor.VirtualNetworks ?? []).Where(i => i.Operation == VirtualNetworkDescriptorOperation.Remove))
            {
                var dbVirtualNetwork = dbWorkspace.VirtualNetworks.FirstOrDefault(i => i.Name == virtualNetworkDescriptor.Name);     // Note that the Virtual Networks within a Workspace must have unique names
                if (dbVirtualNetwork == null) continue; // A name was specified that does not exist, so just ignore it

                dbContext.Remove(dbVirtualNetwork);
            }

            // Next, process all of the Virtual Network additions
            var addVirtualNetworkDescriptors = (workspaceDescriptor.VirtualNetworks ?? []).Where(i => i.Operation == VirtualNetworkDescriptorOperation.Add).ToArray() ?? [];
            if (addVirtualNetworkDescriptors.Length > 0) 
            {
                var existingTags = await dbContext.VirtualNetworks.Where(i => i.Workspace!.DatacenterId == datacenterEntry.DbDatacenter.Id).Select(i => i.Tag).ToListAsync(cancellationToken);
                if (existingTags.Count >= (4096 - datacenterEntry.DatacenterSettings.MinVirtualNetworkTag - addVirtualNetworkDescriptors.Length)) throw new InvalidOperationException("Unable to create new Virtual Networks.  Maximum number of Virtual Networks has been reached.");

                for (int index = 0; index < addVirtualNetworkDescriptors.Length; index++)
                {
                    var dbVirtualNetwork = new DbVirtualNetwork
                    {
                        Index = index,
                        Tag = Enumerable.Range(datacenterEntry.DatacenterSettings.MinVirtualNetworkTag, existingTags.Count + 1).Except(existingTags).First(),  // The lowest Address Tag
                        Name = addVirtualNetworkDescriptors[index].Name!,
                        CreatedAt = now,
                        UpdatedAt = now,
                        WorkspaceId = dbWorkspace.Id,
                        Workspace = dbWorkspace,
                        ZeroTierNetworkId = null
                    };
                    var newVirtualNetwork = await dbContext.VirtualNetworks.AddAsync(dbVirtualNetwork, cancellationToken);
                    existingTags.Add(dbVirtualNetwork.Tag);
                }
            }

            // Finally, process all of the Virtual Network updates
            foreach (var virtualNetworkDescriptor in (workspaceDescriptor.VirtualNetworks ?? []).Where(i => i.Operation == VirtualNetworkDescriptorOperation.Update))
            {
                var dbVirtualNetwork = dbWorkspace.VirtualNetworks.FirstOrDefault(i => i.Name == virtualNetworkDescriptor.Name) ?? throw new InvalidOperationException($"Virtual Network '{virtualNetworkDescriptor.Name}' not found in database for Workspace '{workspaceId}'.");

                // TODO: Update the ZeroTierNetworkId if it has changed
            }

            await dbContext.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);

            return dbWorkspace;
        }
        catch (Exception)
        {
            // TODO: Log this exception
            await transaction.RollbackAsync(cancellationToken);
            throw;
        }
    }

    public async Task<int> DeleteWorkspaceAsync(DbWorkspace dbWorkspace, CancellationToken cancellationToken = default)
    {
        var changes = dbContext.Remove(dbWorkspace);
        var rows = await dbContext.SaveChangesAsync(cancellationToken);
        return rows;
    }

    public async Task<DbVirtualNetwork> UpdateVirtualNetworkAsync(DbVirtualNetwork dbVirtualNetwork, CancellationToken cancellationToken = default)
    {
        dbVirtualNetwork.UpdatedAt = DateTime.UtcNow;
        dbContext.VirtualNetworks.Update(dbVirtualNetwork);
        await dbContext.SaveChangesAsync(cancellationToken);
        return dbVirtualNetwork;
    }
}
