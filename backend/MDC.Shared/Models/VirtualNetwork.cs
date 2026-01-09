using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MDC.Shared.Models;

/// <summary>
/// 
/// </summary>
public class VirtualNetwork
{
    /// <summary>
    /// 
    /// </summary>
    public Guid Id { get; set; }
    /// <summary>
    /// 
    /// </summary>
    public required int Index { get; set; }
    /// <summary>
    /// 
    /// </summary>
    public required string Name { get; set; } = string.Empty;
    /// <summary>
    /// 
    /// </summary>
    public int? Tag { get; set; } = null;
    /// <summary>
    /// 
    /// </summary>
    public string? RemoteNetworkId { get; set; } = null;
}
