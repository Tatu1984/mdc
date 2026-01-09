using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MDC.Core.Services.Providers.MDCDatabase;

internal class DbWorkspace
{
    public Guid Id { get; set; }

    public required Guid DatacenterId { get; set; }

    public virtual DbDatacenter? Datacenter { get; set; }

    public required int Address { get; set; }

    public required string Name { get; set; }

    public required DateTime CreatedAt { get; set; } 

    public required DateTime UpdatedAt { get; set; }

    public required string? Status { get; set; }

    public virtual ICollection<DbVirtualNetwork> VirtualNetworks { get; set; } = new List<DbVirtualNetwork>();
}
