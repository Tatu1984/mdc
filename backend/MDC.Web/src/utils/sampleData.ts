import { Datacenter } from '../types/datacenter';

export const sampleDatacenterData: Datacenter = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  Name: 'Main Datacenter',
  Description: 'Primary datacenter facility hosting all virtual infrastructure',
  Settings: {},
  Workspaces: [
    {
      id: '550e8400-e29b-41d4-a716-446655440001',
      address: 1001,
      name: 'Development Environment',
      description: 'Development workspace for software teams',
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-20T14:45:00Z',
      bastionVirtualMachineId: '550e8400-e29b-41d4-a716-446655440010',
      virtualMachines: [
        {
          id: '550e8400-e29b-41d4-a716-446655440010',
          name: 'dev-bastion-01',
          description: 'Bastion host for development environment',
          status: 'running'
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440011',
          name: 'dev-web-01',
          description: 'Web server for development',
          status: 'running'
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440012',
          name: 'dev-db-01',
          description: 'Database server for development',
          status: 'stopped'
        }
      ],
      virtualNetworks: [
        {
          id: '550e8400-e29b-41d4-a716-446655440020',
          name: 'dev-internal',
          description: 'Internal development network',
          tag: 100,
          index: 0
        }
      ],
      users: [
        {
          id: '550e8400-e29b-41d4-a716-446655440030',
          name: 'John Developer',
          email: 'john@company.com',
          role: 'NestUser'
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440031',
          name: 'Jane DevOps',
          email: 'jane@company.com',
          role: 'NestOwner'
        }
      ],
      devices: []
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440002',
      address: 1002,
      name: 'Production Environment',
      description: 'Production workspace for live applications',
      createdAt: '2024-01-10T09:15:00Z',
      updatedAt: '2024-01-22T16:30:00Z',
      bastionVirtualMachineId: '550e8400-e29b-41d4-a716-446655440013',
      virtualMachines: [
        {
          id: '550e8400-e29b-41d4-a716-446655440013',
          name: 'prod-bastion-01',
          description: 'Bastion host for production environment',
          status: 'running'
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440014',
          name: 'prod-web-01',
          description: 'Primary web server',
          status: 'running'
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440015',
          name: 'prod-web-02',
          description: 'Secondary web server',
          status: 'running'
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440016',
          name: 'prod-db-01',
          description: 'Primary database server',
          status: 'running'
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440017',
          name: 'prod-db-02',
          description: 'Secondary database server',
          status: 'running'
        }
      ],
      virtualNetworks: [
        {
          id: '550e8400-e29b-41d4-a716-446655440021',
          name: 'prod-internal',
          description: 'Internal production network',
          tag: 200,
          index: 0
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440022',
          name: 'prod-dmz',
          description: 'DMZ network for public services',
          tag: 201,
          index: 1
        }
      ],
      users: [
        {
          id: '550e8400-e29b-41d4-a716-446655440032',
          name: 'Admin User',
          email: 'admin@company.com',
          role: 'Administrator'
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440033',
          name: 'Production Manager',
          email: 'prodmgr@company.com',
          role: 'DatacenterManager'
        }
      ],
      devices: [
        {
          id: '550e8400-e29b-41d4-a716-446655440040',
          name: 'monitoring-sensor-01',
          description: 'Temperature and humidity sensor'
        }
      ]
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440003',
      address: 1003,
      name: 'Testing Environment',
      description: 'Testing workspace for QA and staging',
      createdAt: '2024-01-12T11:20:00Z',
      updatedAt: '2024-01-18T13:15:00Z',
      virtualMachines: [
        {
          id: '550e8400-e29b-41d4-a716-446655440018',
          name: 'test-web-01',
          description: 'Testing web server',
          status: 'running'
        }
      ],
      virtualNetworks: [
        {
          id: '550e8400-e29b-41d4-a716-446655440023',
          name: 'test-internal',
          description: 'Internal testing network',
          tag: 300,
          index: 0
        }
      ],
      users: [
        {
          id: '550e8400-e29b-41d4-a716-446655440034',
          name: 'QA Tester',
          email: 'qa@company.com',
          role: 'NestUser'
        }
      ],
      devices: []
    }
  ],
  DeviceConfigurations: [
    {
      id: '550e8400-e29b-41d4-a716-446655440050',
      name: 'Standard Server Config',
      description: 'Standard configuration for server deployment'
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440051',
      name: 'High Performance Config',
      description: 'High performance configuration for demanding workloads'
    }
  ],
  GatewayTemplates: [
    {
      id: '550e8400-e29b-41d4-a716-446655440060',
      name: 'pfSense Gateway',
      description: 'pfSense-based network gateway template'
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440061',
      name: 'OPNsense Gateway',
      description: 'OPNsense-based network gateway template'
    }
  ],
  BastionTemplates: [
    {
      id: '550e8400-e29b-41d4-a716-446655440070',
      name: 'Ubuntu Bastion',
      description: 'Ubuntu-based bastion host template'
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440071',
      name: 'CentOS Bastion',
      description: 'CentOS-based bastion host template'
    }
  ],
  VirtualMachineTemplates: [
    {
      id: '550e8400-e29b-41d4-a716-446655440080',
      name: 'Ubuntu Server 22.04',
      description: 'Ubuntu Server 22.04 LTS template'
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440081',
      name: 'Windows Server 2022',
      description: 'Windows Server 2022 template'
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440082',
      name: 'CentOS Stream 9',
      description: 'CentOS Stream 9 template'
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440083',
      name: 'Debian 12',
      description: 'Debian 12 (Bookworm) template'
    }
  ]
};