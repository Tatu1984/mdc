namespace MDC.Shared.Models;

/// <summary>
/// 
/// </summary>
public class WorkspaceDescriptor
{
    /// <summary>
    /// 
    /// </summary>
    public required string Name { get; set; }

    /// <summary>
    /// 
    /// </summary>
    public BastionDescriptor? Bastion { get; set; }

    /// <summary>
    /// 
    /// </summary>
    public VirtualNetworkDescriptor[]? VirtualNetworks { get; set; }

    /// <summary>
    /// 
    /// </summary>
    public VirtualMachineDescriptor[]? VirtualMachines { get; set; }

    // TODO: DeviceDescriptors property to manage assignment of Devices to a Workspace

    /// <summary>
    /// 
    /// </summary>
    public void Validate()
    {
        // TODO: Validate all of the fields

        // There may be no more than 99 Virtual Networks;  the default Name of a virtual network is $"vnet{index:d2}"
        if (VirtualNetworks != null && VirtualNetworks.Length > 99)
            throw new Exception("A Workspace must have less than 100 Virtual Networks");

        // There may be no more than 99 Virtual Machines
        if (VirtualMachines != null && VirtualMachines.Length > 99)
            throw new Exception("A Workspace must have less than 100 Virtual Machines");

        // All Virtual Machines must have a unique name

        // A Virtual Machine must have less than 100 Network Adapters
    }
}
