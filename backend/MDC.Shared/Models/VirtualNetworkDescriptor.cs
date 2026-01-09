using System.Text.Json.Serialization;

namespace MDC.Shared.Models;

/// <summary>
/// 
/// </summary>
[JsonConverter(typeof(JsonStringEnumConverter))]
public enum VirtualNetworkDescriptorOperation
{
    /// <summary>
    /// 
    /// </summary>
    None,
    /// <summary>
    /// 
    /// </summary>
    Add,
    /// <summary>
    /// 
    /// </summary>
    Update,
    /// <summary>
    /// 
    /// </summary>
    Remove
}

/// <summary>
/// 
/// </summary>
public class VirtualNetworkDescriptor
{
    /// <summary>
    /// 
    /// </summary>
    public string? Name { get; set; }

    /// <summary>
    /// 
    /// </summary>
    public VirtualNetworkGatewayDescriptor? Gateway { get; set; }

    /// <summary>
    /// 
    /// </summary>
    public bool EnableRemoteNetwork { get; set; } = false;

    /// <summary>
    /// 
    /// </summary>
    public string? RemoteNetworkAddressCIDR { get; set; } = null;

    /// <summary>
    /// 
    /// </summary>
    public string? RemoteNetworkIPRangeStart { get; set; } = null;

    /// <summary>
    /// 
    /// </summary>
    public string? RemoteNetworkIPRangeEnd { get; set; } = null;

    /// <summary>
    /// 
    /// </summary>
    public string? RemoteNetworkBastionIPAddress { get; set; } = null;
    /// <summary>
    /// 
    /// </summary>
    public VirtualNetworkDescriptorOperation? Operation { get; set; }
}
