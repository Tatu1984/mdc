import { apiClient } from './apiClient';
import { Datacenter, DatacenterSummary } from '../types/datacenter';

export class DatacenterService {
  private static readonly BASE_PATH = '/odata/Datacenter';

  /**
   * Get datacenter information
   */
  static async getDatacenter(): Promise<Datacenter> {
    return await apiClient.get<Datacenter>(this.BASE_PATH);
  }

  /**
   * Calculate summary statistics for the datacenter
   */
  static calculateSummary(datacenter: Datacenter): DatacenterSummary {
    const totalWorkspaces = datacenter.Workspaces?.length;
    const totalVirtualMachines = datacenter.Workspaces?.reduce(
      (sum, workspace) => sum + workspace.virtualMachines.length, 
      0
    );
    const totalVirtualNetworks = datacenter.Workspaces?.reduce(
      (sum, workspace) => sum + workspace.virtualNetworks.length, 
      0
    );
    const totalUsers = datacenter.Workspaces?.reduce(
      (sum, workspace) => sum + workspace.users.length, 
      0
    );
    const totalDevices = datacenter.Workspaces?.reduce(
      (sum, workspace) => sum + workspace.devices.length, 
      0
    );

    return {
      totalWorkspaces,
      totalVirtualMachines,
      totalVirtualNetworks,
      totalUsers,
      totalDevices,
    };
  }
}

export default DatacenterService;