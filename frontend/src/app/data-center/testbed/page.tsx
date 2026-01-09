'use client'

import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
  Alert,
  Button,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText
} from '@mui/material'
import {
  Science,
  Computer,
  Memory,
  Storage,
  AccountTree,
  Router,
  Cable,
  Speed,
  CloudCircle,
  Folder,
  Error as ErrorIcon,
  CheckCircle,
  Warning,
  LocationOn,
  Schedule,
  Hub,
  Settings
} from '@mui/icons-material'
import AuthGuard from '@/components/AuthGuard'

interface ClusterNode {
  id: string
  name: string
  cpu: string
  ram: string
  status: 'healthy' | 'warning' | 'error'
  utilization: {
    cpu: number
    memory: number
    storage: number
  }
}

interface NetworkSwitch {
  id: string
  name: string
  model: string
  totalPorts: number
  usedPorts: number
  uptime: string
}

interface InfrastructureComponent {
  name: string
  version: string
  status: 'healthy' | 'warning' | 'error' | 'updating'
  lastUpdated: string
}

interface InfrastructureError {
  id: string
  component: string
  severity: 'critical' | 'warning' | 'info'
  message: string
  timestamp: string
}

interface TestbedSettings {
  title: string
  location: string
  defaultGatewayTemplate: string
  defaultBastionTemplate: string
  vlanTagStart: number
  maxWorkstations: number // 0 = no limit
  networkId: string // ZeroTier network ID
  gatewayNodeAffinity: string // empty = any
  bastionNodeAffinity: string // empty = any
  loadDistribution: 'most_utilized' | 'least_utilized' // balance the load
}

interface Testbed {
  id: string
  name: string
  status: 'active' | 'maintenance' | 'offline'
  location: string
  nodes: ClusterNode[]
  clusterStorage: {
    total: string
    used: string
    type: string
  }
  networkSwitches: NetworkSwitch[]
  vmTemplates: number
  workspaces: number
  infrastructureVersions: InfrastructureComponent[]
  infrastructureErrors: InfrastructureError[]
  outboundSpeed: string
  virtualNetworks: number
  capacity: {
    maxWorkspaces: number
    currentWorkspaces: number
    gatewayBastionSize: string
    estimatedAdditional: number
  }
  created: string
  lastMaintenance: string
  settings: TestbedSettings
}

export default function TestbedPage() {
  const [mounted, setMounted] = useState(false)
  const [selectedTestbed, setSelectedTestbed] = useState<string | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [testbeds] = useState<Testbed[]>([
    {
      id: 'tb-001',
      name: 'Production Cluster Alpha',
      status: 'active',
      location: 'Data Center A - Rack Row 1',
      nodes: [
        {
          id: 'node-001',
          name: 'alpha-node-01',
          cpu: '2x Intel Xeon Gold 6348 (56 cores)',
          ram: '512 GB DDR4-3200',
          status: 'healthy',
          utilization: { cpu: 65, memory: 78, storage: 45 }
        },
        {
          id: 'node-002',
          name: 'alpha-node-02',
          cpu: '2x Intel Xeon Gold 6348 (56 cores)',
          ram: '512 GB DDR4-3200',
          status: 'healthy',
          utilization: { cpu: 72, memory: 68, storage: 52 }
        },
        {
          id: 'node-003',
          name: 'alpha-node-03',
          cpu: '2x Intel Xeon Gold 6348 (56 cores)',
          ram: '512 GB DDR4-3200',
          status: 'warning',
          utilization: { cpu: 45, memory: 88, storage: 38 }
        },
        {
          id: 'node-004',
          name: 'alpha-node-04',
          cpu: '2x Intel Xeon Gold 6348 (56 cores)',
          ram: '512 GB DDR4-3200',
          status: 'healthy',
          utilization: { cpu: 58, memory: 75, storage: 42 }
        }
      ],
      clusterStorage: {
        total: '48 TB',
        used: '21.6 TB',
        type: 'Distributed SSD (Ceph)'
      },
      networkSwitches: [
        {
          id: 'sw-001',
          name: 'SW-CORE-ALPHA-01',
          model: 'Cisco Nexus 9300',
          totalPorts: 48,
          usedPorts: 32,
          uptime: '127 days'
        },
        {
          id: 'sw-002',
          name: 'SW-CORE-ALPHA-02',
          model: 'Cisco Nexus 9300',
          totalPorts: 48,
          usedPorts: 28,
          uptime: '127 days'
        },
        {
          id: 'sw-003',
          name: 'SW-MGMT-ALPHA-01',
          model: 'Cisco Catalyst 9200',
          totalPorts: 24,
          usedPorts: 16,
          uptime: '180 days'
        }
      ],
      vmTemplates: 12,
      workspaces: 8,
      infrastructureVersions: [
        { name: 'Proxmox VE', version: '8.1.4', status: 'healthy', lastUpdated: '2024-01-18' },
        { name: 'Ceph Storage', version: '18.2.0', status: 'healthy', lastUpdated: '2024-01-05' },
        { name: 'Switch Firmware (Nexus)', version: '10.2(5)M', status: 'healthy', lastUpdated: '2024-01-12' },
        { name: 'Switch Firmware (Catalyst)', version: '16.12.10', status: 'healthy', lastUpdated: '2024-01-14' },
        { name: 'TechNest App', version: '2.1.8', status: 'healthy', lastUpdated: '2024-01-19' },
        { name: 'TechNest UI', version: '1.4.2', status: 'healthy', lastUpdated: '2024-01-20' },
        { name: 'PostgreSQL', version: '15.5', status: 'healthy', lastUpdated: '2024-01-16' },
        { name: 'Prometheus', version: '2.47.2', status: 'healthy', lastUpdated: '2024-01-18' },
        { name: 'Grafana', version: '10.2.2', status: 'healthy', lastUpdated: '2024-01-16' }
      ],
      infrastructureErrors: [
        {
          id: 'err-002',
          component: 'alpha-node-03',
          severity: 'warning',
          message: 'Memory utilization high (88%)',
          timestamp: '2024-01-20 14:20:00'
        }
      ],
      outboundSpeed: '10 Gbps',
      virtualNetworks: 15,
      capacity: {
        maxWorkspaces: 25,
        currentWorkspaces: 8,
        gatewayBastionSize: '4GB RAM + 2 vCPU',
        estimatedAdditional: 17
      },
      created: '2023-08-15',
      lastMaintenance: '2024-01-10',
      settings: {
        title: 'Production Cluster Alpha',
        location: 'Data Center A - Rack Row 1',
        defaultGatewayTemplate: 'Ubuntu 22.04 Gateway (2GB RAM, 2 vCPU)',
        defaultBastionTemplate: 'Ubuntu 22.04 Bastion (4GB RAM, 2 vCPU)',
        vlanTagStart: 100,
        maxWorkstations: 50,
        networkId: 'a0b1c2d3e4f5g678',
        gatewayNodeAffinity: 'alpha-node-01,alpha-node-02',
        bastionNodeAffinity: 'alpha-node-03,alpha-node-04',
        loadDistribution: 'least_utilized'
      }
    },
    {
      id: 'tb-002',
      name: 'Development Cluster Beta',
      status: 'active',
      location: 'Data Center A - Rack Row 2',
      nodes: [
        {
          id: 'node-005',
          name: 'beta-node-01',
          cpu: '2x Intel Xeon Silver 4314 (32 cores)',
          ram: '256 GB DDR4-2933',
          status: 'healthy',
          utilization: { cpu: 35, memory: 45, storage: 28 }
        },
        {
          id: 'node-006',
          name: 'beta-node-02',
          cpu: '2x Intel Xeon Silver 4314 (32 cores)',
          ram: '256 GB DDR4-2933',
          status: 'healthy',
          utilization: { cpu: 42, memory: 52, storage: 34 }
        },
        {
          id: 'node-007',
          name: 'beta-node-03',
          cpu: '2x Intel Xeon Silver 4314 (32 cores)',
          ram: '256 GB DDR4-2933',
          status: 'healthy',
          utilization: { cpu: 28, memory: 38, storage: 22 }
        }
      ],
      clusterStorage: {
        total: '24 TB',
        used: '8.4 TB',
        type: 'Distributed SSD (Longhorn)'
      },
      networkSwitches: [
        {
          id: 'sw-004',
          name: 'SW-CORE-BETA-01',
          model: 'Cisco Catalyst 9300',
          totalPorts: 24,
          usedPorts: 18,
          uptime: '89 days'
        },
        {
          id: 'sw-005',
          name: 'SW-MGMT-BETA-01',
          model: 'Cisco Catalyst 9200',
          totalPorts: 24,
          usedPorts: 12,
          uptime: '89 days'
        }
      ],
      vmTemplates: 8,
      workspaces: 5,
      infrastructureVersions: [
        { name: 'Proxmox VE', version: '8.1.3', status: 'healthy', lastUpdated: '2024-01-10' },
        { name: 'Longhorn Storage', version: '1.5.3', status: 'healthy', lastUpdated: '2024-01-14' },
        { name: 'Switch Firmware (Catalyst)', version: '16.12.10', status: 'healthy', lastUpdated: '2024-01-12' },
        { name: 'TechNest App', version: '2.1.6', status: 'healthy', lastUpdated: '2024-01-15' },
        { name: 'TechNest UI', version: '1.4.1', status: 'healthy', lastUpdated: '2024-01-16' },
        { name: 'PostgreSQL', version: '15.4', status: 'healthy', lastUpdated: '2024-01-08' },
        { name: 'Prometheus', version: '2.47.2', status: 'healthy', lastUpdated: '2024-01-18' }
      ],
      infrastructureErrors: [],
      outboundSpeed: '5 Gbps',
      virtualNetworks: 8,
      capacity: {
        maxWorkspaces: 15,
        currentWorkspaces: 5,
        gatewayBastionSize: '2GB RAM + 1 vCPU',
        estimatedAdditional: 10
      },
      created: '2023-10-20',
      lastMaintenance: '2024-01-08',
      settings: {
        title: 'Development Cluster Beta',
        location: 'Data Center A - Rack Row 2',
        defaultGatewayTemplate: 'Ubuntu 20.04 Gateway (1GB RAM, 1 vCPU)',
        defaultBastionTemplate: 'Ubuntu 20.04 Bastion (2GB RAM, 1 vCPU)',
        vlanTagStart: 200,
        maxWorkstations: 25,
        networkId: 'b1c2d3e4f5g6h789',
        gatewayNodeAffinity: '',
        bastionNodeAffinity: 'beta-node-01',
        loadDistribution: 'most_utilized'
      }
    },
    {
      id: 'tb-003',
      name: 'Edge Computing Cluster',
      status: 'maintenance',
      location: 'Edge Site B - Container 1',
      nodes: [
        {
          id: 'node-008',
          name: 'edge-node-01',
          cpu: '1x Intel Xeon D-2146NT (8 cores)',
          ram: '128 GB DDR4-2666',
          status: 'error',
          utilization: { cpu: 0, memory: 0, storage: 0 }
        },
        {
          id: 'node-009',
          name: 'edge-node-02',
          cpu: '1x Intel Xeon D-2146NT (8 cores)',
          ram: '128 GB DDR4-2666',
          status: 'healthy',
          utilization: { cpu: 15, memory: 25, storage: 18 }
        }
      ],
      clusterStorage: {
        total: '8 TB',
        used: '2.1 TB',
        type: 'Local NVMe + Backup'
      },
      networkSwitches: [
        {
          id: 'sw-006',
          name: 'SW-EDGE-01',
          model: 'Cisco IE-3300',
          totalPorts: 8,
          usedPorts: 6,
          uptime: '45 days'
        }
      ],
      vmTemplates: 4,
      workspaces: 2,
      infrastructureVersions: [
        { name: 'Proxmox VE', version: '8.0.4', status: 'warning', lastUpdated: '2023-12-15' },
        { name: 'K3s', version: 'v1.28.2+k3s1', status: 'healthy', lastUpdated: '2024-01-12' },
        { name: 'Local Storage', version: '2.4.1', status: 'error', lastUpdated: '2024-01-05' },
        { name: 'Switch Firmware (IE-3300)', version: '16.12.09', status: 'healthy', lastUpdated: '2024-01-08' },
        { name: 'TechNest App', version: '2.0.3', status: 'warning', lastUpdated: '2024-01-05' },
        { name: 'TechNest UI', version: '1.3.1', status: 'warning', lastUpdated: '2024-01-06' },
        { name: 'PostgreSQL', version: '14.9', status: 'warning', lastUpdated: '2023-12-20' }
      ],
      infrastructureErrors: [
        {
          id: 'err-003',
          component: 'edge-node-01',
          severity: 'critical',
          message: 'Node offline - Hardware failure detected',
          timestamp: '2024-01-20 08:15:00'
        },
        {
          id: 'err-004',
          component: 'Local Storage',
          severity: 'critical',
          message: 'Storage controller malfunction',
          timestamp: '2024-01-20 08:20:00'
        }
      ],
      outboundSpeed: '1 Gbps',
      virtualNetworks: 3,
      capacity: {
        maxWorkspaces: 6,
        currentWorkspaces: 2,
        gatewayBastionSize: '1GB RAM + 1 vCPU',
        estimatedAdditional: 0
      },
      created: '2023-12-01',
      lastMaintenance: '2024-01-20',
      settings: {
        title: 'Edge Computing Cluster',
        location: 'Edge Site B - Container 1',
        defaultGatewayTemplate: 'Alpine Linux Gateway (512MB RAM, 1 vCPU)',
        defaultBastionTemplate: 'Alpine Linux Bastion (1GB RAM, 1 vCPU)',
        vlanTagStart: 300,
        maxWorkstations: 0, // no limit
        networkId: 'c2d3e4f5g6h7i890',
        gatewayNodeAffinity: 'edge-node-02',
        bastionNodeAffinity: 'edge-node-02',
        loadDistribution: 'least_utilized'
      }
    }
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': case 'healthy': return 'success'
      case 'maintenance': case 'warning': return 'warning'
      case 'offline': case 'error': return 'error'
      case 'updating': return 'info'
      default: return 'default'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle color="success" fontSize="small" />
      case 'warning': return <Warning color="warning" fontSize="small" />
      case 'error': return <ErrorIcon color="error" fontSize="small" />
      default: return <CheckCircle color="disabled" fontSize="small" />
    }
  }

  const getTotalResources = (nodes: ClusterNode[]) => {
    const totalCores = nodes.reduce((sum, node) => {
      const cores = parseInt(node.cpu.match(/\((\d+) cores\)/)?.[1] || '0')
      return sum + cores
    }, 0)

    const totalRAM = nodes.reduce((sum, node) => {
      const ram = parseInt(node.ram.match(/(\d+) GB/)?.[1] || '0')
      return sum + ram
    }, 0)

    return { cores: totalCores, ram: totalRAM }
  }

  const getTotalSwitchPorts = (switches: NetworkSwitch[]) => {
    return switches.reduce((acc, sw) => ({
      total: acc.total + sw.totalPorts,
      used: acc.used + sw.usedPorts
    }), { total: 0, used: 0 })
  }

  const formatDate = (dateString: string) => {
    if (!mounted) return dateString
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatDateTime = (dateString: string) => {
    if (!mounted) return dateString
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <AuthGuard>
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Science sx={{ color: 'primary.main', fontSize: '3rem' }} />
          <Box>
            <Typography variant="h3" component="h1" fontWeight="bold">
              Testbed Infrastructure
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Monitor cluster resources, infrastructure, and capacity
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Testbeds */}
      <Grid container spacing={4}>
        {testbeds.map((testbed) => {
          const totalResources = getTotalResources(testbed.nodes)
          const switchPorts = getTotalSwitchPorts(testbed.networkSwitches)
          const storageUsedPercent = (parseFloat(testbed.clusterStorage.used) / parseFloat(testbed.clusterStorage.total)) * 100

          return (
            <Grid item xs={12} key={testbed.id}>
              <Card elevation={3}>
                <CardContent sx={{ p: 4 }}>
                  {/* Header */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Box>
                      <Typography variant="h4" fontWeight="bold" gutterBottom>
                        {testbed.name}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Chip
                          label={testbed.status}
                          color={getStatusColor(testbed.status) as any}
                          sx={{ textTransform: 'capitalize' }}
                        />
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <LocationOn fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary">
                            {testbed.location}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                    <Box sx={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                      <Tooltip title="Edit Testbed Settings">
                        <IconButton
                          onClick={() => {
                            setSelectedTestbed(testbed.id)
                            setSettingsOpen(true)
                          }}
                          color="primary"
                          size="small"
                          sx={{ mb: 1 }}
                        >
                          <Settings />
                        </IconButton>
                      </Tooltip>
                      <Typography variant="body2" color="text.secondary">
                        Created: {formatDate(testbed.created)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Last Maintenance: {formatDate(testbed.lastMaintenance)}
                      </Typography>
                    </Box>
                  </Box>

                  <Grid container spacing={3}>
                    {/* Cluster Overview */}
                    <Grid item xs={12} lg={4}>
                      <Paper elevation={1} sx={{ p: 3, height: '100%' }}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <AccountTree color="primary" />
                          Cluster Overview
                        </Typography>
                        <Stack spacing={2}>
                          <Box>
                            <Typography variant="body2" color="text.secondary">Nodes</Typography>
                            <Typography variant="h4" fontWeight="bold" color="primary.main">
                              {testbed.nodes.length}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="body2" color="text.secondary">Total CPU Cores</Typography>
                            <Typography variant="h5" fontWeight="bold">
                              {totalResources.cores}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="body2" color="text.secondary">Total RAM</Typography>
                            <Typography variant="h5" fontWeight="bold">
                              {totalResources.ram} GB
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="body2" color="text.secondary">Cluster Storage</Typography>
                            <Typography variant="body1" fontWeight="medium">
                              {testbed.clusterStorage.used} / {testbed.clusterStorage.total}
                            </Typography>
                            <LinearProgress
                              variant="determinate"
                              value={storageUsedPercent}
                              color={storageUsedPercent > 80 ? 'error' : storageUsedPercent > 60 ? 'warning' : 'primary'}
                              sx={{ mt: 1, height: 8, borderRadius: 4 }}
                            />
                            <Typography variant="caption" color="text.secondary">
                              {testbed.clusterStorage.type}
                            </Typography>
                          </Box>
                        </Stack>
                      </Paper>
                    </Grid>

                    {/* Network Infrastructure */}
                    <Grid item xs={12} lg={4}>
                      <Paper elevation={1} sx={{ p: 3, height: '100%' }}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Router color="secondary" />
                          Network Infrastructure
                        </Typography>
                        <Stack spacing={2}>
                          <Box>
                            <Typography variant="body2" color="text.secondary">Connected Switches</Typography>
                            <Typography variant="h4" fontWeight="bold" color="secondary.main">
                              {testbed.networkSwitches.length}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="body2" color="text.secondary">Total Ports</Typography>
                            <Typography variant="h5" fontWeight="bold">
                              {switchPorts.total}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="body2" color="text.secondary">Available Ports</Typography>
                            <Typography variant="h5" fontWeight="bold" color="success.main">
                              {switchPorts.total - switchPorts.used}
                            </Typography>
                            <LinearProgress
                              variant="determinate"
                              value={(switchPorts.used / switchPorts.total) * 100}
                              color="secondary"
                              sx={{ mt: 1, height: 8, borderRadius: 4 }}
                            />
                          </Box>
                          <Box>
                            <Typography variant="body2" color="text.secondary">Outbound Speed</Typography>
                            <Typography variant="body1" fontWeight="medium">
                              {testbed.outboundSpeed}
                            </Typography>
                          </Box>
                        </Stack>
                      </Paper>
                    </Grid>

                    {/* Capacity & Resources */}
                    <Grid item xs={12} lg={4}>
                      <Paper elevation={1} sx={{ p: 3, height: '100%' }}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Speed color="warning" />
                          Capacity Analysis
                        </Typography>
                        <Stack spacing={2}>
                          <Box>
                            <Typography variant="body2" color="text.secondary">VM Templates</Typography>
                            <Typography variant="h4" fontWeight="bold" color="info.main">
                              {testbed.vmTemplates}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="body2" color="text.secondary">Active Workspaces</Typography>
                            <Typography variant="h5" fontWeight="bold">
                              {testbed.workspaces}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="body2" color="text.secondary">Virtual Networks</Typography>
                            <Typography variant="h5" fontWeight="bold">
                              {testbed.virtualNetworks}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="body2" color="text.secondary">Estimated Additional Workspaces</Typography>
                            <Typography variant="h5" fontWeight="bold" color="success.main">
                              {testbed.capacity.estimatedAdditional}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Gateway+Bastion: {testbed.capacity.gatewayBastionSize}
                            </Typography>
                          </Box>
                        </Stack>
                      </Paper>
                    </Grid>

                    {/* Node Details */}
                    <Grid item xs={12} lg={6}>
                      <Paper elevation={1} sx={{ p: 3 }}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Computer color="primary" />
                          Cluster Nodes
                        </Typography>
                        <TableContainer>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>Node</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>CPU</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>RAM</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {testbed.nodes.map((node) => (
                                <TableRow key={node.id}>
                                  <TableCell>
                                    <Typography variant="body2" fontWeight="medium">
                                      {node.name}
                                    </Typography>
                                  </TableCell>
                                  <TableCell>
                                    <Typography variant="body2">
                                      {node.cpu}
                                    </Typography>
                                    <LinearProgress
                                      variant="determinate"
                                      value={node.utilization.cpu}
                                      color={node.utilization.cpu > 80 ? 'error' : 'primary'}
                                      sx={{ mt: 0.5, height: 4 }}
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Typography variant="body2">
                                      {node.ram}
                                    </Typography>
                                    <LinearProgress
                                      variant="determinate"
                                      value={node.utilization.memory}
                                      color={node.utilization.memory > 80 ? 'error' : 'success'}
                                      sx={{ mt: 0.5, height: 4 }}
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                                      {getStatusIcon(node.status)}
                                      <span>
                                        {node.status}
                                      </span>
                                    </span>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Paper>
                    </Grid>

                    {/* Infrastructure Versions */}
                    <Grid item xs={12} lg={6}>
                      <Paper elevation={1} sx={{ p: 3 }}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Schedule color="info" />
                          Infrastructure Updates
                        </Typography>
                        <TableContainer sx={{ maxHeight: 280 }}>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>Component</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Version</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Updated</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {testbed.infrastructureVersions.map((component, index) => (
                                <TableRow key={index}>
                                  <TableCell>
                                    <Typography variant="body2" fontWeight="medium">
                                      {component.name}
                                    </Typography>
                                  </TableCell>
                                  <TableCell>
                                    <Typography variant="body2" fontFamily="monospace">
                                      {component.version}
                                    </Typography>
                                  </TableCell>
                                  <TableCell>
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                                      {getStatusIcon(component.status)}
                                      <span>
                                        {component.status}
                                      </span>
                                    </span>
                                  </TableCell>
                                  <TableCell>
                                    <Typography variant="body2" color="text.secondary">
                                      {formatDate(component.lastUpdated)}
                                    </Typography>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Paper>
                    </Grid>

                    {/* Infrastructure Errors */}
                    {testbed.infrastructureErrors.length > 0 && (
                      <Grid item xs={12}>
                        <Alert severity="warning" sx={{ mb: 2 }}>
                          <Typography variant="h6" fontWeight="bold" gutterBottom>
                            Infrastructure Alerts
                          </Typography>
                          <List dense>
                            {testbed.infrastructureErrors.map((error) => (
                              <ListItem key={error.id} sx={{ pl: 0 }}>
                                <ListItemText
                                  primary={
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                                      <Chip
                                        label={error.severity}
                                        color={error.severity === 'critical' ? 'error' : 'warning'}
                                        size="small"
                                      />
                                      <span style={{ fontWeight: 500 }}>
                                        {error.component}
                                      </span>
                                    </span>
                                  }
                                  secondary={
                                    <span>
                                      <span style={{ display: 'block', marginTop: '4px' }}>
                                        {error.message}
                                      </span>
                                      <span style={{ display: 'block', fontSize: '0.75rem', color: 'rgba(0, 0, 0, 0.6)', marginTop: '2px' }}>
                                        {formatDateTime(error.timestamp)}
                                      </span>
                                    </span>
                                  }
                                />
                              </ListItem>
                            ))}
                          </List>
                        </Alert>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          )
        })}
      </Grid>

      {/* Settings Dialog */}
      <Dialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h5" fontWeight="bold">
            Edit Testbed Settings
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {selectedTestbed && testbeds.find(t => t.id === selectedTestbed)?.name}
          </Typography>
        </DialogTitle>
        <DialogContent>
          {selectedTestbed && (() => {
            const testbed = testbeds.find(t => t.id === selectedTestbed)
            if (!testbed) return null

            return (
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Title"
                    value={testbed.settings.title}
                    variant="outlined"
                    helperText="Display name for the testbed"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Location"
                    value={testbed.settings.location}
                    variant="outlined"
                    helperText="Physical location of the testbed"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Default Gateway Template"
                    value={testbed.settings.defaultGatewayTemplate}
                    variant="outlined"
                    helperText="VM template for gateway instances"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Default Bastion Template"
                    value={testbed.settings.defaultBastionTemplate}
                    variant="outlined"
                    helperText="VM template for bastion instances"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="VLAN Tag Start Number"
                    type="number"
                    value={testbed.settings.vlanTagStart}
                    variant="outlined"
                    helperText="Starting VLAN tag for workspaces"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Max Workstations"
                    type="number"
                    value={testbed.settings.maxWorkstations}
                    variant="outlined"
                    helperText="Maximum workstations (0 = no limit)"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Network ID (ZeroTier)"
                    value={testbed.settings.networkId}
                    variant="outlined"
                    helperText="ZeroTier network identifier"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Gateway Node Affinity"
                    value={testbed.settings.gatewayNodeAffinity}
                    variant="outlined"
                    helperText="Preferred nodes for gateways (empty = any)"
                    placeholder="node-01,node-02"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Bastion Node Affinity"
                    value={testbed.settings.bastionNodeAffinity}
                    variant="outlined"
                    helperText="Preferred nodes for bastions (empty = any)"
                    placeholder="node-03,node-04"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Load Distribution Strategy</InputLabel>
                    <Select
                      value={testbed.settings.loadDistribution}
                      label="Load Distribution Strategy"
                    >
                      <MenuItem value="most_utilized">Most Utilized (Pack VMs)</MenuItem>
                      <MenuItem value="least_utilized">Least Utilized (Balance Load)</MenuItem>
                    </Select>
                    <FormHelperText>Strategy for distributing VMs across nodes</FormHelperText>
                  </FormControl>
                </Grid>
              </Grid>
            )
          })()}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setSettingsOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={() => {
              // TODO: Implement save functionality
              setSettingsOpen(false)
            }}
            variant="contained"
            color="primary"
          >
            Save Settings
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
    </AuthGuard>
  )
}