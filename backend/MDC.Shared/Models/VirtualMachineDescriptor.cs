using System.Text.Json.Serialization;

namespace MDC.Shared.Models;

/// <summary>
/// 
/// </summary>
[JsonConverter(typeof(JsonStringEnumConverter))]
public enum VirtualMachineDescriptorOperation
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
    Remove,
    /// <summary>
    /// 
    /// </summary>
    Reboot,
    /// <summary>
    /// 
    /// </summary>
    Restart,
    /// <summary>
    /// 
    /// </summary>
    Redeploy
}

/// <summary>
/// 
/// </summary>
public class VirtualMachineDescriptor
{
    /// <summary>
    /// 
    /// </summary>
    public string? Name { get; set; }

    /// <summary>
    /// 
    /// </summary>
    public string? TemplateName {get; set;}

    /// <summary>
    /// 
    /// </summary>
    public int? TemplateRevision { get; set; }

    /// <summary>
    /// 
    /// </summary>
    public VirtualMachineNetworkAdapterDescriptor[]? NetworkAdapters { get; set; }
    /// <summary>
    /// 
    /// </summary>
    public VirtualMachineDescriptorOperation? Operation { get; set; }

    // TODO: Specify additional properties such as:
    // CPU count
    // RAM size
    // See https://tensparrows.visualstudio.com/MicroDataCenter/_workitems/edit/58
}
