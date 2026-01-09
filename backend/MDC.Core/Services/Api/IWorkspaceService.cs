using System.Text.Json.Nodes;

namespace MDC.Core.Services.Api;

/// <summary>
/// 
/// </summary>
public interface IWorkspaceService
{
    /// <summary/>
    Task<IEnumerable<Workspace>> GetAllAsync(string site, CancellationToken cancellationToken = default);

    /// <summary/>
    Task<Workspace?> GetByIdAsync(string site, Guid id, CancellationToken cancellationToken = default);

    /// <summary/>
    Task<Workspace?> GetByAddressAsync(string site, int address, CancellationToken cancellationToken = default);

    /// <summary/>
    Task<Workspace> CreateAsync(string site, WorkspaceDescriptor workspace, CancellationToken cancellationToken = default);

    /// <summary/>
    Task<Workspace> UpdateAsync(string site, Guid workspaceId, JsonNode delta, CancellationToken cancellationToken = default);

    /// <summary/>
    Task DeleteAsync(string site, Guid id, CancellationToken cancellationToken = default);
}
