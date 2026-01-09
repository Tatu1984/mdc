using MDC.Core.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MDC.Core.Services.Providers.Settings;

internal interface ISettingsService
{
    public Task<DatacenterEntry> GetDatacenterEntryAsync(bool createWorkspaceEntryFromPveResource = false, CancellationToken cancellationToken = default);

    public Task<DatacenterEntry> GetDatacenterEntryByWorkspaceIdAsync(Guid workspaceId, bool populateDatacenterTemplates = false, CancellationToken cancellationToken = default);

    // public Task<DatacenterEntry> GetDatacenterEntryByVirtualNetworkIdAsync(Guid workspaceId, bool populateDatacenterTemplates = false, CancellationToken cancellationToken = default);

    Task<DatacenterSettings> GetDatacenterSettingsAsync(CancellationToken cancellationToken = default);
}
