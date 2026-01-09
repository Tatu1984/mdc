export interface VirtualMachineTemplate {
  id: string;
  name: string;
  description: string;
  // Add more properties as needed based on actual API response
}

export interface Settings {
  [key: string]: unknown;
}

export interface VirtualMachine {
  id: string;
  name: string;
  description: string;
  status?: string;
  // Add more properties as needed
}

export interface VirtualNetwork {
  id: string;
  name: string;
  description: string;
  tag: number;
  index: number;
  // Add more properties as needed
}

export interface WorkspaceUser {
  id: string;
  name: string;
  email?: string;
  role?: string;
  // Add more properties as needed
}

export interface Device {
  id: string;
  name: string;
  description: string;
  // Add more properties as needed
}

export interface Workspace {
  id: string;
  address: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  bastionVirtualMachineId?: string;
  virtualMachines: VirtualMachine[];
  virtualNetworks: VirtualNetwork[];
  users: WorkspaceUser[];
  devices: Device[];
}

export interface DeviceConfiguration {
  id: string;
  name: string;
  description: string;
  // Add more properties as needed
}

export interface Datacenter {
  id: string;
  Name: string;
  Description: string;
  Settings: Settings;
  Workspaces: Workspace[];
  DeviceConfigurations: DeviceConfiguration[];
  GatewayTemplates: VirtualMachineTemplate[];
  BastionTemplates: VirtualMachineTemplate[];
  VirtualMachineTemplates: VirtualMachineTemplate[];
}

export interface DatacenterSummary {
  totalWorkspaces: number;
  totalVirtualMachines: number;
  totalVirtualNetworks: number;
  totalUsers: number;
  totalDevices: number;
}