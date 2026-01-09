using MDC.Core.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MDC.Core.Services.Providers.MDCDatabase
{
    internal interface IMDCDatabaseService
    {
        /// <summary>
        /// Initializes the database.
        /// </summary>
        Task RecreateDatabaseAsync(CancellationToken cancellationToken = default);

        Task<DbDatacenter> CreateDatacenterAsync(string name, string description, CancellationToken cancellationToken = default);

        Task<DbDatacenter?> GetDatacenterByNameAsync(string name, CancellationToken cancellationToken = default);

        Task<DbWorkspace[]> GetAllWorkspacesAsync(CancellationToken cancellationToken = default);

        Task<DbWorkspace[]> ImportWorkspacesAsync(Guid datacenterId, IEnumerable<WorkspaceEntry> workspaceEntries, CancellationToken cancellationToken = default);

        //Task<DbVirtualNetwork[]> ImportVirtualNetworksAsync(Guid workspaceId, IEnumerable<VirtualNetworkEntry> virtualNetworkEntries, CancellationToken cancellationToken = default);

        Task<DbVirtualNetwork[]> ImportVirtualNetworksAsync(IEnumerable<WorkspaceEntry> workspaceEntries, CancellationToken cancellationToken = default);

        Task<DbWorkspace?> GetWorkspaceByIdAsync(Guid id, CancellationToken cancellationToken = default);

        Task<DbWorkspace> CreateWorkspaceAsync(DatacenterEntry datacenterEntry, string workspaceName, string[] virtualNetworkNames, CancellationToken cancellationToken = default);

        Task<DbWorkspace> UpdateWorkspaceAsync(DatacenterEntry datacenterEntry, Guid workspaceId, WorkspaceDescriptor workspaceDescriptor, CancellationToken cancellationToken = default);

        Task<int> DeleteWorkspaceAsync(DbWorkspace dbWorkpace, CancellationToken cancellationToken = default);

        Task<DbVirtualNetwork> UpdateVirtualNetworkAsync(DbVirtualNetwork dbVirtualNetwork, CancellationToken cancellationToken = default);
    }
}
