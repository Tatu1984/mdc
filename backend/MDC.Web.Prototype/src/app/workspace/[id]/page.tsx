'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Paper,
  LinearProgress,
  Chip,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  IconButton,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material'
import {
  Folder,
  Group,
  Code,
  Analytics,
  Settings,
  PlayArrow,
  Stop,
  CloudDownload,
  Computer,
  Science,
  AccountTree,
  Storage,
  Memory,
  Speed,
  Add,
  Pause,
  DeleteOutline,
  Terminal,
  Router,
  Security,
  Schedule,
  CalendarToday,
  Timeline,
  NetworkCheck,
  VpnKey,
  Hub,
  Lock,
  LockOpen,
  Label,
  LocalOffer,
  ExpandMore,
  Dns,
  NetworkCheck as DhcpIcon,
  RouterOutlined,
  Lan
} from '@mui/icons-material'

interface WorkspaceDetails {
  id: string
  name: string
  description: string
  status: 'running' | 'stopped' | 'deploying'
  locked: boolean
  createdDate: string
  ttlHours: number
  testbed: {
    name: string
    nodes: number
    environment: string
  }
  virtualNetworks: {
    id: string
    name: string
    cidr: string
    status: 'active' | 'inactive'
    dhcpEnabled: boolean
    dnsServers: string[]
    gateway: string
    lanNetwork: string
    subnets: { name: string; cidr: string; availableIps: number }[]
  }[]
  bastionMachine: {
    id: string
    name: string
    status: 'running' | 'stopped'
    ip: string
    template: string
    resources: { cpu: string; memory: string; storage: string }
  }
  vms: {
    id: string
    name: string
    status: 'running' | 'stopped' | 'paused'
    template: string
    resources: { cpu: string; memory: string; storage: string }
    ip: string
    networkId: string
    bastionAccess: boolean
  }[]
  members: { name: string; email: string; role: string }[]
  workstations: {
    total: number
    assigned: number
    available: number
    list: {
      id: string
      name: string
      type: string
      serialNumber: string
      status: 'assigned' | 'available' | 'maintenance'
      assignedTo?: string
      location: string
      ports: { number: number; networkName: string; status: 'connected' | 'disconnected' }[]
    }[]
  }
  actionsLog: {
    id: string
    action: string
    user: string
    timestamp: string
    status: 'success' | 'failed' | 'pending'
    details?: string
  }[]
  deployments: {
    id: string
    version: string
    status: 'success' | 'failed' | 'pending'
    timestamp: string
  }[]
  tags: {
    key: string
    value: string
    category: 'project' | 'team' | 'stage' | 'custom'
  }[]
  environment: {
    type: string
    version: string
    ports: number[]
  }
}

export default function WorkspaceDetailPage() {
  const params = useParams()
  const workspaceId = params.id as string

  // Mock data - would typically come from API
  const [workspace] = useState<WorkspaceDetails>({
    id: workspaceId,
    name: 'AI Research Project',
    description: 'Machine learning models and data analysis for customer behavior prediction',
    status: 'running',
    locked: false,
    createdDate: '2024-01-15T10:30:00Z',
    ttlHours: 168, // 7 days
    testbed: {
      name: 'Development Environment',
      nodes: 3,
      environment: 'Python ML Stack'
    },
    virtualNetworks: [
      {
        id: 'vnet-1',
        name: 'AI-Research-VNet',
        cidr: '10.0.0.0/16',
        status: 'active',
        dhcpEnabled: true,
        dnsServers: ['8.8.8.8', '8.8.4.4'],
        gateway: '10.0.0.1',
        lanNetwork: '192.168.100.0/24',
        subnets: [
          { name: 'compute-subnet', cidr: '10.0.1.0/24', availableIps: 240 },
          { name: 'data-subnet', cidr: '10.0.2.0/24', availableIps: 250 },
          { name: 'bastion-subnet', cidr: '10.0.3.0/28', availableIps: 12 }
        ]
      }
    ],
    bastionMachine: {
      id: 'bastion-1',
      name: 'AI-Research-Bastion',
      status: 'running',
      ip: '10.0.3.4',
      template: 'Ubuntu 22.04 Bastion',
      resources: { cpu: '2 vCPUs', memory: '4 GB', storage: '20 GB' }
    },
    vms: [
      { id: 'vm-1', name: 'ML Training Server', status: 'running', template: 'Ubuntu ML', resources: { cpu: '4 vCPUs', memory: '16 GB', storage: '100 GB' }, ip: '10.0.1.10', networkId: 'vnet-1', bastionAccess: true },
      { id: 'vm-2', name: 'Data Processing', status: 'running', template: 'Ubuntu Server', resources: { cpu: '2 vCPUs', memory: '8 GB', storage: '50 GB' }, ip: '10.0.2.10', networkId: 'vnet-1', bastionAccess: true },
      { id: 'vm-3', name: 'Web Interface', status: 'paused', template: 'Ubuntu Web', resources: { cpu: '2 vCPUs', memory: '4 GB', storage: '20 GB' }, ip: '10.0.1.20', networkId: 'vnet-1', bastionAccess: true },
      { id: 'vm-4', name: 'Database Server', status: 'stopped', template: 'PostgreSQL', resources: { cpu: '2 vCPUs', memory: '8 GB', storage: '200 GB' }, ip: '10.0.2.20', networkId: 'vnet-1', bastionAccess: false }
    ],
    members: [
      { name: 'John Doe', email: 'john@microdatacenter.com', role: 'Owner' },
      { name: 'Sarah Smith', email: 'sarah@microdatacenter.com', role: 'Contributor' },
      { name: 'Mike Johnson', email: 'mike@microdatacenter.com', role: 'Contributor' },
    ],
    workstations: {
      total: 12,
      assigned: 8,
      available: 4,
      list: [
        {
          id: 'ws-001',
          name: 'Dell XR12-001',
          type: 'Dell XR12',
          serialNumber: 'DL001XR12',
          status: 'assigned',
          assignedTo: 'AI Research Project',
          location: 'Rack A1-U10',
          ports: [
            { number: 1, networkName: 'AI-Research-VNet', status: 'connected' },
            { number: 2, networkName: 'Management-Network', status: 'connected' }
          ]
        },
        {
          id: 'ws-002',
          name: 'HPE Server-002',
          type: 'HPE ProLiant DL360',
          serialNumber: 'HPE002DL360',
          status: 'assigned',
          assignedTo: 'AI Research Project',
          location: 'Rack A1-U12',
          ports: [
            { number: 1, networkName: 'AI-Research-VNet', status: 'connected' },
            { number: 2, networkName: 'Storage-Network', status: 'disconnected' }
          ]
        },
        {
          id: 'ws-003',
          name: 'Dell XR800-003',
          type: 'Dell XR800',
          serialNumber: 'DL003XR800',
          status: 'assigned',
          assignedTo: 'AI Research Project',
          location: 'Rack A2-U05',
          ports: [
            { number: 1, networkName: 'AI-Research-VNet', status: 'connected' },
            { number: 2, networkName: 'Management-Network', status: 'connected' },
            { number: 3, networkName: 'Storage-Network', status: 'connected' },
            { number: 4, networkName: 'Backup-Network', status: 'connected' }
          ]
        },
        {
          id: 'ws-004',
          name: 'Intel NUC-004',
          type: 'Intel NUC',
          serialNumber: 'NUC004INTEL',
          status: 'available',
          location: 'Rack B1-U20',
          ports: [
            { number: 1, networkName: 'Unassigned', status: 'disconnected' }
          ]
        },
        {
          id: 'ws-005',
          name: 'IP Camera-005',
          type: 'IP Security Camera',
          serialNumber: 'CAM005SEC',
          status: 'assigned',
          assignedTo: 'AI Research Project',
          location: 'Wall Mount A',
          ports: [
            { number: 1, networkName: 'Security-Network', status: 'connected' }
          ]
        },
        {
          id: 'ws-006',
          name: 'Temp Sensor-006',
          type: 'Temperature Sensor',
          serialNumber: 'TEMP006SENS',
          status: 'assigned',
          assignedTo: 'AI Research Project',
          location: 'Rack A1-Top',
          ports: [
            { number: 1, networkName: 'IoT-Network', status: 'connected' }
          ]
        }
      ]
    },
    actionsLog: [
      { id: '1', action: 'VM Started', user: 'John Doe', timestamp: '2024-01-20 14:30:00', status: 'success', details: 'Started ML Training Server' },
      { id: '2', action: 'VM Paused', user: 'Sarah Smith', timestamp: '2024-01-20 13:15:00', status: 'success', details: 'Paused Web Interface VM' },
      { id: '3', action: 'Network Created', user: 'Mike Johnson', timestamp: '2024-01-20 10:45:00', status: 'success', details: 'Created AI-Research-VNet' },
      { id: '4', action: 'VM Deployment', user: 'John Doe', timestamp: '2024-01-20 09:30:00', status: 'failed', details: 'Failed to deploy Database Server - insufficient resources' },
      { id: '5', action: 'Bastion Started', user: 'System', timestamp: '2024-01-15 10:30:00', status: 'success', details: 'Bastion machine automatically started' }
    ],
    deployments: [
      { id: '1', version: 'v1.2.3', status: 'success', timestamp: '2024-01-20 14:30' },
      { id: '2', version: 'v1.2.2', status: 'success', timestamp: '2024-01-19 10:15' },
      { id: '3', version: 'v1.2.1', status: 'failed', timestamp: '2024-01-18 16:45' },
    ],
    tags: [
      { key: 'Project', value: 'AI Research Initiative', category: 'project' },
      { key: 'Team', value: 'Data Science Team', category: 'team' },
      { key: 'Stage', value: 'Development', category: 'stage' },
      { key: 'Owner', value: 'John Doe', category: 'custom' },
      { key: 'Budget Code', value: 'AI-2024-Q1', category: 'custom' },
      { key: 'Priority', value: 'High', category: 'custom' }
    ],
    environment: {
      type: 'Python 3.9',
      version: '3.9.18',
      ports: [8000, 8080, 5432]
    }
  })

  const [activeTab, setActiveTab] = useState('overview')
  const [assignDialogOpen, setAssignDialogOpen] = useState(false)
  const [newWorkstation, setNewWorkstation] = useState({
    type: '',
    serialNumber: '',
    ports: [{ number: 1, networkName: '', status: 'disconnected' }]
  })

  // Calculate days left based on TTL
  const calculateDaysLeft = () => {
    const createdDate = new Date(workspace.createdDate)
    const expiryDate = new Date(createdDate.getTime() + workspace.ttlHours * 60 * 60 * 1000)
    const now = new Date()
    const daysLeft = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return Math.max(0, daysLeft)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const daysLeft = calculateDaysLeft()
  const isExpiringSoon = daysLeft <= 2

  // Network topology UML component
  const NetworkTopologyDiagram = () => {
    return (
      <Paper elevation={1} sx={{ p: 4, bgcolor: 'grey.50' }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <AccountTree color="primary" />
          Network Topology
        </Typography>
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 3,
          minHeight: 500,
          border: '2px dashed',
          borderColor: 'grey.300',
          borderRadius: 2,
          p: 3
        }}>
          {/* Bastion Host */}
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            p: 3,
            bgcolor: 'warning.50',
            border: '3px solid',
            borderColor: 'warning.main',
            borderRadius: 3,
            minWidth: 300,
            justifyContent: 'center',
            boxShadow: 2
          }}>
            <VpnKey color="warning" sx={{ fontSize: '2rem' }} />
            <Box>
              <Typography variant="h6" fontWeight="bold">
                {workspace.bastionMachine.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {workspace.bastionMachine.ip} • {workspace.bastionMachine.template}
              </Typography>
              <Chip
                label={workspace.bastionMachine.status}
                color={getStatusColor(workspace.bastionMachine.status)}
                size="small"
                sx={{ mt: 0.5 }}
              />
            </Box>
          </Box>

          {/* Connection Line */}
          <Box sx={{ height: 30, width: 4, bgcolor: 'grey.400', borderRadius: 2 }} />

          {/* Virtual Network */}
          <Box sx={{
            border: '3px solid',
            borderColor: 'primary.main',
            borderRadius: 3,
            p: 4,
            bgcolor: 'primary.50',
            minWidth: 600,
            maxWidth: 800,
            boxShadow: 2
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Hub color="primary" sx={{ fontSize: '2rem' }} />
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  {workspace.virtualNetworks[0]?.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {workspace.virtualNetworks[0]?.cidr}
                </Typography>
              </Box>
            </Box>

            {/* Subnets */}
            <Typography variant="body1" fontWeight="bold" sx={{ mb: 2 }}>
              Network Subnets:
            </Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              {workspace.virtualNetworks[0]?.subnets.map((subnet, index) => (
                <Grid item xs={12} md={4} key={index}>
                  <Paper elevation={2} sx={{ p: 2, bgcolor: 'white', textAlign: 'center' }}>
                    <Typography variant="body2" fontWeight="medium">
                      {subnet.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {subnet.cidr}
                    </Typography>
                    <Chip
                      label={`${subnet.availableIps} IPs available`}
                      size="small"
                      color={subnet.availableIps > 50 ? 'success' : 'warning'}
                      variant="outlined"
                    />
                  </Paper>
                </Grid>
              ))}
            </Grid>

            {/* VMs */}
            <Typography variant="body1" fontWeight="bold" sx={{ mb: 2 }}>
              Virtual Machines ({workspace.vms.length}):
            </Typography>
            <Grid container spacing={2}>
              {workspace.vms.map((vm) => (
                <Grid item xs={12} sm={6} md={3} key={vm.id}>
                  <Paper elevation={2} sx={{
                    p: 2,
                    bgcolor: vm.status === 'running' ? 'success.50' : vm.status === 'paused' ? 'warning.50' : 'error.50',
                    border: '2px solid',
                    borderColor: vm.status === 'running' ? 'success.main' : vm.status === 'paused' ? 'warning.main' : 'error.main',
                    borderRadius: 2
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Computer sx={{ fontSize: 20 }} color={vm.status === 'running' ? 'success' : vm.status === 'paused' ? 'warning' : 'error'} />
                      <Typography variant="body2" fontWeight="bold">
                        {vm.name}
                      </Typography>
                    </Box>
                    <Typography variant="caption" display="block" color="text.secondary" sx={{ mb: 0.5 }}>
                      {vm.ip}
                    </Typography>
                    <Typography variant="caption" display="block" color="text.secondary" sx={{ mb: 1 }}>
                      {vm.template}
                    </Typography>
                    <Chip
                      label={vm.status}
                      color={vm.status === 'running' ? 'success' : vm.status === 'paused' ? 'warning' : 'error'}
                      size="small"
                    />
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>

          <Typography variant="caption" color="text.secondary" sx={{ mt: 2 }}>
            Legend: Green=Running, Yellow=Paused, Red=Stopped
          </Typography>
        </Box>
      </Paper>
    )
  }

  const getStatusColor = (status: string): 'success' | 'error' | 'warning' | 'default' => {
    switch (status) {
      case 'running': return 'success'
      case 'stopped': return 'error'
      case 'deploying': return 'warning'
      default: return 'default'
    }
  }

  const getDeploymentStatusColor = (status: string): 'success' | 'error' | 'warning' | 'default' => {
    switch (status) {
      case 'success': return 'success'
      case 'failed': return 'error'
      case 'pending': return 'warning'
      default: return 'default'
    }
  }

  const runningVMs = workspace.vms.filter(vm => vm.status === 'running').length

  return (
    <Box>
      {/* Header */}
      <Card elevation={2} sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Typography variant="h3" component="h1" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Folder color="primary" />
                {workspace.name}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                {workspace.description}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Chip
                  icon={<CalendarToday />}
                  label={`Created: ${formatDate(workspace.createdDate)}`}
                  color="info"
                  variant="outlined"
                  size="small"
                />
                <Chip
                  icon={<Schedule />}
                  label={`TTL: ${workspace.ttlHours}h`}
                  color="secondary"
                  variant="outlined"
                  size="small"
                />
                <Chip
                  icon={<Timeline />}
                  label={`${daysLeft} days left`}
                  color={isExpiringSoon ? 'error' : 'success'}
                  variant={isExpiringSoon ? 'filled' : 'outlined'}
                  size="small"
                />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Chip
                  icon={<Science />}
                  label={`Testbed: ${workspace.testbed.name}`}
                  color="info"
                  variant="outlined"
                />
                <Chip
                  icon={<AccountTree />}
                  label={`${workspace.testbed.nodes} Nodes`}
                  color="secondary"
                  variant="outlined"
                />
                <Chip
                  icon={<Computer />}
                  label={`${runningVMs}/${workspace.vms.length} VMs Running`}
                  color="primary"
                  variant="outlined"
                />
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {workspace.locked && (
                <Chip
                  icon={<Lock />}
                  label="Locked"
                  color="warning"
                  variant="filled"
                />
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Navigation Tabs */}
      <Card elevation={2}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            sx={{ px: 2 }}
          >
            <Tab
              icon={<Analytics />}
              label="Overview"
              value="overview"
              iconPosition="start"
            />
            <Tab
              icon={<Security />}
              label="Bastion"
              value="bastion"
              iconPosition="start"
            />
            <Tab
              icon={<NetworkCheck />}
              label="Networks"
              value="networks"
              iconPosition="start"
            />
            <Tab
              icon={<Computer />}
              label="Virtual Machines"
              value="vms"
              iconPosition="start"
            />
            <Tab
              icon={<Router />}
              label="Workstations"
              value="workstations"
              iconPosition="start"
            />
            <Tab
              icon={<Settings />}
              label="Settings"
              value="settings"
              iconPosition="start"
            />
            <Tab
              icon={<Timeline />}
              label="Actions Log"
              value="actions"
              iconPosition="start"
            />
          </Tabs>
        </Box>

        <CardContent>
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <Box>
              {/* Workspace Metrics Cards */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={4}>
                  <Paper elevation={1} sx={{ p: 3, bgcolor: 'primary.50' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Computer sx={{ color: 'primary.main', mr: 1 }} />
                      <Typography variant="h6" fontWeight="bold">Virtual Machines</Typography>
                    </Box>
                    <Typography variant="h3" fontWeight="bold" color="primary.main" gutterBottom>
                      {workspace.vms.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {runningVMs} running • {workspace.vms.filter(vm => vm.status === 'paused').length} paused • {workspace.vms.filter(vm => vm.status === 'stopped').length} stopped
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Paper elevation={1} sx={{ p: 3, bgcolor: 'success.50' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Hub sx={{ color: 'success.main', mr: 1 }} />
                      <Typography variant="h6" fontWeight="bold">Virtual Networks</Typography>
                    </Box>
                    <Typography variant="h3" fontWeight="bold" color="success.main" gutterBottom>
                      {workspace.virtualNetworks.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {workspace.virtualNetworks[0]?.subnets.length || 0} subnets configured
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Paper elevation={1} sx={{ p: 3, bgcolor: 'secondary.50' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Router sx={{ color: 'secondary.main', mr: 1 }} />
                      <Typography variant="h6" fontWeight="bold">Workstations</Typography>
                    </Box>
                    <Typography variant="h3" fontWeight="bold" color="secondary.main" gutterBottom>
                      {workspace.workstations.assigned}/{workspace.workstations.total}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {workspace.workstations.available} available for assignment
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <NetworkTopologyDiagram />
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Networks Tab */}
          {activeTab === 'networks' && (
            <Box>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                Virtual Networks ({workspace.virtualNetworks.length})
              </Typography>
              {workspace.virtualNetworks.map((network) => (
                <Card key={network.id} elevation={1} sx={{ mb: 3 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                      <Typography variant="h6" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Hub color="primary" />
                        {network.name}
                      </Typography>
                      <Chip
                        label={network.status}
                        color={network.status === 'active' ? 'success' : 'error'}
                        size="small"
                      />
                    </Box>

                    {/* Network Configuration */}
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                      <Grid item xs={12} sm={6} md={3}>
                        <Paper elevation={1} sx={{ p: 2, bgcolor: 'grey.50' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <RouterOutlined color="primary" fontSize="small" />
                            <Typography variant="subtitle2" fontWeight="bold">
                              Gateway
                            </Typography>
                          </Box>
                          <Typography variant="body2">
                            {network.gateway}
                          </Typography>
                        </Paper>
                      </Grid>

                      <Grid item xs={12} sm={6} md={3}>
                        <Paper elevation={1} sx={{ p: 2, bgcolor: 'grey.50' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Lan color="secondary" fontSize="small" />
                            <Typography variant="subtitle2" fontWeight="bold">
                              LAN Network
                            </Typography>
                          </Box>
                          <Typography variant="body2">
                            {network.lanNetwork}
                          </Typography>
                        </Paper>
                      </Grid>

                      <Grid item xs={12} sm={6} md={3}>
                        <Paper elevation={1} sx={{ p: 2, bgcolor: 'grey.50' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <DhcpIcon color="success" fontSize="small" />
                            <Typography variant="subtitle2" fontWeight="bold">
                              DHCP
                            </Typography>
                          </Box>
                          <Chip
                            label={network.dhcpEnabled ? 'Enabled' : 'Disabled'}
                            color={network.dhcpEnabled ? 'success' : 'error'}
                            size="small"
                            variant="outlined"
                          />
                        </Paper>
                      </Grid>

                      <Grid item xs={12} sm={6} md={3}>
                        <Paper elevation={1} sx={{ p: 2, bgcolor: 'grey.50' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Dns color="info" fontSize="small" />
                            <Typography variant="subtitle2" fontWeight="bold">
                              DNS Servers
                            </Typography>
                          </Box>
                          <Box>
                            {network.dnsServers.map((dns, idx) => (
                              <Typography key={idx} variant="caption" display="block">
                                {dns}
                              </Typography>
                            ))}
                          </Box>
                        </Paper>
                      </Grid>
                    </Grid>

                    {/* CIDR Information */}
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Network CIDR:</strong> {network.cidr}
                      </Typography>
                    </Box>

                    <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 2 }}>
                      Subnets:
                    </Typography>
                    <Grid container spacing={2}>
                      {network.subnets.map((subnet, index) => (
                        <Grid item xs={12} md={4} key={index}>
                          <Paper elevation={1} sx={{ p: 2, bgcolor: 'grey.50' }}>
                            <Typography variant="body2" fontWeight="medium">
                              {subnet.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {subnet.cidr}
                            </Typography>
                            <Box sx={{ mt: 1 }}>
                              <Chip
                                label={`${subnet.availableIps} IPs available`}
                                size="small"
                                color={subnet.availableIps > 50 ? 'success' : subnet.availableIps > 10 ? 'warning' : 'error'}
                                variant="outlined"
                              />
                            </Box>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}

          {/* Bastion Tab */}
          {activeTab === 'bastion' && (
            <Box>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                Bastion Machine
              </Typography>
              <Card elevation={1}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <VpnKey color="primary" />
                      {workspace.bastionMachine.name}
                    </Typography>
                    <Chip
                      label={workspace.bastionMachine.status}
                      color={getStatusColor(workspace.bastionMachine.status)}
                    />
                  </Box>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Typography variant="body2">
                          <strong>IP Address:</strong> {workspace.bastionMachine.ip}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Template:</strong> {workspace.bastionMachine.template}
                        </Typography>
                        <Typography variant="body2">
                          <strong>CPU:</strong> {workspace.bastionMachine.resources.cpu}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Memory:</strong> {workspace.bastionMachine.resources.memory}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Storage:</strong> {workspace.bastionMachine.resources.storage}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {workspace.bastionMachine.status === 'running' ? (
                          <Button
                            variant="outlined"
                            color="error"
                            startIcon={<Stop />}
                            size="small"
                          >
                            Stop
                          </Button>
                        ) : (
                          <Button
                            variant="outlined"
                            color="success"
                            startIcon={<PlayArrow />}
                            size="small"
                          >
                            Start
                          </Button>
                        )}
                        <Button
                          variant="outlined"
                          startIcon={<Terminal />}
                          size="small"
                        >
                          SSH Connect
                        </Button>
                        <Button
                          variant="outlined"
                          startIcon={<Settings />}
                          size="small"
                        >
                          Configure
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Box>
          )}

          {/* Workstations Tab */}
          {activeTab === 'workstations' && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" fontWeight="bold">
                  Workspace Workstations ({workspace.workstations.assigned})
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Router />}
                  color="secondary"
                  onClick={() => setAssignDialogOpen(true)}
                >
                  Assign Workstation
                </Button>
              </Box>
              <Grid container spacing={3}>
                {workspace.workstations.list.filter(ws => ws.status === 'assigned').map((workstation) => (
                  <Grid item xs={12} md={6} lg={4} key={workstation.id}>
                    <Paper elevation={2} sx={{ p: 3 }}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="h6" fontWeight="bold">
                          {workstation.name}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                        <Typography variant="body2">
                          <strong>Type:</strong> {workstation.type}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Serial:</strong> {workstation.serialNumber}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Location:</strong> {workstation.location}
                        </Typography>
                      </Box>
                      <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
                        Network Assignments:
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        {workstation.ports.map((port, index) => (
                          <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="caption">
                              Port {port.number} → {port.networkName}
                            </Typography>
                            <Chip
                              label={port.status}
                              color={port.status === 'connected' ? 'success' : 'error'}
                              size="small"
                              variant="outlined"
                            />
                          </Box>
                        ))}
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                        <Button size="small" variant="outlined" color="warning">
                          Unassign
                        </Button>
                        <Button size="small" variant="outlined" color="primary">
                          Configure
                        </Button>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Virtual Machines Tab */}
          {activeTab === 'vms' && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" fontWeight="bold">
                  Virtual Machines ({workspace.vms.length})
                </Typography>
                <Button variant="contained" startIcon={<Add />}>
                  Add New VM
                </Button>
              </Box>
              <Grid container spacing={2}>
                {workspace.vms.map((vm) => (
                  <Grid item xs={12} md={6} key={vm.id}>
                    <Paper elevation={1} sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="h6" fontWeight="bold">
                          {vm.name}
                        </Typography>
                        <Chip
                          label={vm.status}
                          color={vm.status === 'running' ? 'success' : vm.status === 'paused' ? 'warning' : 'error'}
                          size="small"
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Template: {vm.template} • IP: {vm.ip}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Network: {vm.networkId} • Bastion: {vm.bastionAccess ? 'Enabled' : 'Disabled'}
                      </Typography>
                      <Divider sx={{ my: 1 }} />
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mb: 2 }}>
                        <Typography variant="caption">
                          CPU: {vm.resources.cpu} • Memory: {vm.resources.memory}
                        </Typography>
                        <Typography variant="caption">
                          Storage: {vm.resources.storage}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {vm.status === 'running' ? (
                          <>
                            <IconButton color="warning" size="small" title="Pause">
                              <Pause />
                            </IconButton>
                            <IconButton color="error" size="small" title="Stop">
                              <Stop />
                            </IconButton>
                          </>
                        ) : vm.status === 'paused' ? (
                          <>
                            <IconButton color="success" size="small" title="Resume">
                              <PlayArrow />
                            </IconButton>
                            <IconButton color="error" size="small" title="Stop">
                              <Stop />
                            </IconButton>
                          </>
                        ) : (
                          <IconButton color="success" size="small" title="Start">
                            <PlayArrow />
                          </IconButton>
                        )}
                        <IconButton color="primary" size="small" title="Execute Command">
                          <Terminal />
                        </IconButton>
                        <IconButton color="error" size="small" title="Delete">
                          <DeleteOutline />
                        </IconButton>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Actions Log Tab */}
          {activeTab === 'actions' && (
            <Box>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                Workspace Actions Log
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'grey.50' }}>
                      <TableCell sx={{ fontWeight: 'bold' }}>Action</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>User</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Timestamp</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Details</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {workspace.actionsLog.map((action) => (
                      <TableRow key={action.id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {action.action}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ width: 24, height: 24, bgcolor: 'primary.main', fontSize: '0.75rem' }}>
                              {action.user[0]}
                            </Avatar>
                            <Typography variant="body2">
                              {action.user}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {new Date(action.timestamp).toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={action.status}
                            color={getDeploymentStatusColor(action.status)}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {action.details || '-'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}


          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <Box>
                <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocalOffer color="primary" />
                  Workspace Tags
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Tags help organize and categorize your workspace for better management and reporting.
                </Typography>

                {/* All Tags */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                  {workspace.tags.map((tag, index) => (
                    <Chip
                      key={index}
                      label={`${tag.key}: ${tag.value}`}
                      color="primary"
                      variant="outlined"
                      deleteIcon={workspace.locked ? undefined : <DeleteOutline />}
                      onDelete={workspace.locked ? undefined : () => {}}
                      sx={{ borderRadius: 1 }}
                    />
                  ))}
                </Box>

                <Button variant="contained" startIcon={<LocalOffer />} disabled={workspace.locked}>
                  Add Tag
                </Button>
              </Box>

              <Box>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  Workspace Security
                </Typography>
                <Paper elevation={1} sx={{ p: 3, bgcolor: 'warning.50', border: 1, borderColor: 'warning.main' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" fontWeight="bold">
                        Workspace Lock Status
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {workspace.locked
                          ? 'Workspace is locked. No changes can be made until unlocked.'
                          : 'Workspace is unlocked. Changes can be made to configuration and resources.'
                        }
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {workspace.locked && (
                        <Chip
                          icon={<Lock />}
                          label="Locked"
                          color="warning"
                          variant="filled"
                        />
                      )}
                      <Button
                        variant="contained"
                        color={workspace.locked ? "success" : "warning"}
                        startIcon={workspace.locked ? <LockOpen /> : <Lock />}
                        disabled={workspace.status === 'deploying'}
                      >
                        {workspace.locked ? 'Unlock' : 'Lock'} Workspace
                      </Button>
                    </Box>
                  </Box>
                </Paper>
              </Box>

              <Box>
                <Typography variant="h5" fontWeight="bold" color="error.main" gutterBottom>
                  Danger Zone
                </Typography>
                <Paper
                  elevation={1}
                  sx={{
                    p: 3,
                    border: 1,
                    borderColor: 'error.main',
                    bgcolor: 'error.50'
                  }}
                >
                  <Button
                    variant="contained"
                    color="error"
                    startIcon={<DeleteOutline />}
                    disabled={workspace.locked || workspace.status === 'deploying'}
                    sx={{ mb: 2 }}
                  >
                    Delete Workspace
                  </Button>
                  <Typography variant="body2" color="text.secondary">
                    This action cannot be undone. All VMs, data, and configurations will be permanently deleted.
                    {workspace.locked && ' Workspace must be unlocked before deletion.'}
                  </Typography>
                </Paper>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Assign Workstation Dialog */}
      <Dialog
        open={assignDialogOpen}
        onClose={() => setAssignDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h5" fontWeight="bold">
            Assign Workstation to Workspace
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Configure workstation type, serial number, and network assignments
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Workstation Type</InputLabel>
                <Select
                  value={newWorkstation.type}
                  label="Workstation Type"
                  onChange={(e) => setNewWorkstation({...newWorkstation, type: e.target.value})}
                >
                  <MenuItem value="Dell XR12">Dell XR12</MenuItem>
                  <MenuItem value="Dell XR800">Dell XR800</MenuItem>
                  <MenuItem value="HPE ProLiant DL360">HPE ProLiant DL360</MenuItem>
                  <MenuItem value="Intel NUC">Intel NUC</MenuItem>
                  <MenuItem value="IP Security Camera">IP Security Camera</MenuItem>
                  <MenuItem value="Temperature Sensor">Temperature Sensor</MenuItem>
                  <MenuItem value="Humidity Sensor">Humidity Sensor</MenuItem>
                </Select>
                <FormHelperText>Select the type of workstation hardware</FormHelperText>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Serial Number"
                value={newWorkstation.serialNumber}
                onChange={(e) => setNewWorkstation({...newWorkstation, serialNumber: e.target.value})}
                variant="outlined"
                helperText="Enter the workstation serial number"
              />
            </Grid>
            <Grid item xs={12}>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography variant="h6" fontWeight="bold">
                    Advanced: Network Port Configuration
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Configure which virtual networks each workstation port should be assigned to.
                  </Typography>
                  <Grid container spacing={2}>
                    {newWorkstation.ports.map((port, index) => (
                      <Grid item xs={12} md={6} key={index}>
                        <FormControl fullWidth>
                          <InputLabel>Port {port.number} Network</InputLabel>
                          <Select
                            value={port.networkName}
                            label={`Port ${port.number} Network`}
                            onChange={(e) => {
                              const updatedPorts = [...newWorkstation.ports]
                              updatedPorts[index].networkName = e.target.value
                              setNewWorkstation({...newWorkstation, ports: updatedPorts})
                            }}
                          >
                            <MenuItem value="AI-Research-VNet">AI-Research-VNet</MenuItem>
                            <MenuItem value="Management-Network">Management-Network</MenuItem>
                            <MenuItem value="Storage-Network">Storage-Network</MenuItem>
                            <MenuItem value="Security-Network">Security-Network</MenuItem>
                            <MenuItem value="IoT-Network">IoT-Network</MenuItem>
                            <MenuItem value="Backup-Network">Backup-Network</MenuItem>
                            <MenuItem value="Unassigned">Unassigned</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                    ))}
                  </Grid>
                  <Box sx={{ mt: 2 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => {
                        const newPortNumber = newWorkstation.ports.length + 1
                        setNewWorkstation({
                          ...newWorkstation,
                          ports: [...newWorkstation.ports, { number: newPortNumber, networkName: '', status: 'disconnected' }]
                        })
                      }}
                    >
                      Add Port
                    </Button>
                  </Box>
                </AccordionDetails>
              </Accordion>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setAssignDialogOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={() => {
              // TODO: Implement workstation assignment
              setAssignDialogOpen(false)
              setNewWorkstation({ type: '', serialNumber: '', ports: [{ number: 1, networkName: '', status: 'disconnected' }] })
            }}
            variant="contained"
            color="secondary"
            disabled={!newWorkstation.type || !newWorkstation.serialNumber}
          >
            Assign Workstation
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}