namespace MDC.Shared.Models;

/// <summary>
/// 
/// </summary>
public class BastionDescriptor
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
    /// 
    /// </summary>
    public VirtualMachineDescriptorOperation? Operation { get; set; }
}
