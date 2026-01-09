using System.Text.Json.Serialization;

namespace MDC.Shared.Models;

/// <summary>
/// Network which the WAN interface of the Virtual Network Gateway is connected to.
/// </summary>
public enum VirtualNetworkGatewayWANNetworkType
{
    /// <summary>
    /// Connect the Gateway WAN through the Data network, having egress to the internet. 
    /// </summary>
    Egress,
    /// <summary>
    /// Connect the Gateway WAN to another Virtual Network within the workspace.  RefGatewayWANVirtualNetworkName must have a value of a valid Virtual Network within the Workspace.
    /// </summary>
    Internal,
    /// <summary>
    /// When supported by MDC configuration, connect the Gateway WAN to the outside network bridge interface of MDC.  This setting allows the possibility in inbound network connections and should be used with caution.
    /// </summary>
    Public
}

/// <summary>
/// 
/// </summary>
public class VirtualNetworkGatewayDescriptor
{
    /// <summary>
    /// 
    /// </summary>
    public string? TemplateName { get; set; }

    /// <summary>
    /// 
    /// </summary>
    public int? TemplateRevision { get; set; }

    /// <summary>
    /// Network which the WAN interface of the Virtual Network Gateway is connected to.
    /// </summary>
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public VirtualNetworkGatewayWANNetworkType? WANNetworkType { get; set; }

    /// <summary>
    /// When WANNetworkType = Internal, RefGatewayWANVirtualNetworkName must have a value of a valid Virtual Network within the Workspace
    /// </summary>
    public string? RefInternalWANVirtualNetworkName { get; set; }

    /// <summary>
    /// 
    /// </summary>
    public VirtualMachineDescriptorOperation? Operation { get; set; }

}
