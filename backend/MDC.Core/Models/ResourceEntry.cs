using MDC.Core.Services.Providers.PVEClient;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MDC.Core.Models;

internal abstract class ResourceEntry
{
    public required PVEResource? PVEResource { get; set; }

    public required int? Index { get; set; }

    public required string? Name { get; set; }

    public PVEQemuConfig? PVEQemuConfig { get; set; }

    public PVEQemuStatus? PVEQemuStatus { get; set; }
}
