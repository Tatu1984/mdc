'use client'

import { useState } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  Chip,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Stack,
  InputAdornment,
  Tooltip,
  Badge
} from '@mui/material'
import {
  Computer,
  Search,
  FilterList,
  Settings,
  Cable,
  Assignment,
  Visibility,
  Edit,
  Router,
  Sensors,
  Videocam,
  DeviceHub,
  Memory,
  Storage,
  Circle,
  CheckCircle,
  Cancel,
  Assignment as AssignmentIcon
} from '@mui/icons-material'

interface Port {
  id: string
  name: string
  type: 'ethernet' | 'usb' | 'hdmi' | 'power' | 'serial'
  status: 'connected' | 'disconnected'
  switchPort?: string
  switchName?: string
}

interface Workstation {
  id: string
  type: 'Dell XR12' | 'Dell XR800' | 'HPE ProLiant' | 'IP Camera' | 'Intel NUC' | 'Temperature Sensor' | 'Humidity Sensor'
  serialNumber: string
  model: string
  manufacturer: string
  status: 'assigned' | 'unassigned' | 'maintenance' | 'offline'
  assignedWorkspace?: string
  assignedUser?: string
  location: string
  specs: {
    cpu?: string
    memory?: string
    storage?: string
    network?: string
    power?: string
    resolution?: string
    range?: string
    accuracy?: string
  }
  ports: Port[]
  lastSeen: string
  ipAddress?: string
  macAddress?: string
  notes?: string
}

export default function WorkstationsPage() {
  const [workstations] = useState<Workstation[]>([
    {
      id: 'ws-001',
      type: 'Dell XR12',
      serialNumber: 'DXR12-7F8G9H0',
      model: 'PowerEdge XR12',
      manufacturer: 'Dell Technologies',
      status: 'assigned',
      assignedWorkspace: 'AI Research Project',
      assignedUser: 'John Doe',
      location: 'Rack A1-U15',
      specs: {
        cpu: '2x Intel Xeon Silver 4314',
        memory: '128 GB DDR4',
        storage: '2x 960GB NVMe SSD',
        network: '4x 25GbE SFP28',
        power: '750W Platinum'
      },
      ports: [
        { id: 'p1', name: 'NIC1', type: 'ethernet', status: 'connected', switchPort: 'Gi1/0/1', switchName: 'SW-CORE-01' },
        { id: 'p2', name: 'NIC2', type: 'ethernet', status: 'connected', switchPort: 'Gi1/0/2', switchName: 'SW-CORE-01' },
        { id: 'p3', name: 'NIC3', type: 'ethernet', status: 'disconnected' },
        { id: 'p4', name: 'NIC4', type: 'ethernet', status: 'disconnected' },
        { id: 'p5', name: 'USB1', type: 'usb', status: 'disconnected' },
        { id: 'p6', name: 'PWR1', type: 'power', status: 'connected', switchPort: 'PDU-A1-08', switchName: 'PDU-RACK-A1' }
      ],
      lastSeen: '2024-01-20T14:30:00Z',
      ipAddress: '10.0.1.15',
      macAddress: '00:14:22:01:23:45',
      notes: 'Primary ML training server'
    },
    {
      id: 'ws-002',
      type: 'Dell XR800',
      serialNumber: 'DXR800-9K2L3M4',
      model: 'PowerEdge XR800',
      manufacturer: 'Dell Technologies',
      status: 'assigned',
      assignedWorkspace: 'Web Development',
      assignedUser: 'Sarah Smith',
      location: 'Rack A1-U10',
      specs: {
        cpu: '4x Intel Xeon Platinum 8380',
        memory: '512 GB DDR4',
        storage: '8x 1.92TB NVMe SSD',
        network: '8x 25GbE SFP28',
        power: '1400W Platinum'
      },
      ports: [
        { id: 'p1', name: 'NIC1', type: 'ethernet', status: 'connected', switchPort: 'Gi1/0/5', switchName: 'SW-CORE-01' },
        { id: 'p2', name: 'NIC2', type: 'ethernet', status: 'connected', switchPort: 'Gi1/0/6', switchName: 'SW-CORE-01' },
        { id: 'p3', name: 'NIC3', type: 'ethernet', status: 'connected', switchPort: 'Gi2/0/1', switchName: 'SW-CORE-02' },
        { id: 'p4', name: 'NIC4', type: 'ethernet', status: 'connected', switchPort: 'Gi2/0/2', switchName: 'SW-CORE-02' },
        { id: 'p5', name: 'PWR1', type: 'power', status: 'connected', switchPort: 'PDU-A1-05', switchName: 'PDU-RACK-A1' },
        { id: 'p6', name: 'PWR2', type: 'power', status: 'connected', switchPort: 'PDU-A1-06', switchName: 'PDU-RACK-A1' }
      ],
      lastSeen: '2024-01-20T14:25:00Z',
      ipAddress: '10.0.1.20',
      macAddress: '00:14:22:02:34:56'
    },
    {
      id: 'ws-003',
      type: 'HPE ProLiant',
      serialNumber: 'HPE-DL380-5N6P7Q8',
      model: 'ProLiant DL380 Gen11',
      manufacturer: 'Hewlett Packard Enterprise',
      status: 'unassigned',
      location: 'Rack B2-U20',
      specs: {
        cpu: '2x Intel Xeon Gold 6348',
        memory: '256 GB DDR4',
        storage: '4x 1.8TB SAS HDD + 2x 960GB NVMe',
        network: '4x 10GbE + 2x 25GbE',
        power: '800W Platinum'
      },
      ports: [
        { id: 'p1', name: 'NIC1', type: 'ethernet', status: 'disconnected' },
        { id: 'p2', name: 'NIC2', type: 'ethernet', status: 'disconnected' },
        { id: 'p3', name: 'NIC3', type: 'ethernet', status: 'disconnected' },
        { id: 'p4', name: 'NIC4', type: 'ethernet', status: 'disconnected' },
        { id: 'p5', name: 'PWR1', type: 'power', status: 'connected', switchPort: 'PDU-B2-12', switchName: 'PDU-RACK-B2' }
      ],
      lastSeen: '2024-01-20T12:00:00Z',
      ipAddress: '10.0.2.30',
      macAddress: '94:57:A5:12:34:67'
    },
    {
      id: 'ws-004',
      type: 'IP Camera',
      serialNumber: 'CAM-4K-A1B2C3D4',
      model: 'DS-2CD2186G2-ISU/SL',
      manufacturer: 'Hikvision',
      status: 'assigned',
      assignedWorkspace: 'Palet Defect Detection',
      location: 'Production Line A - Station 3',
      specs: {
        resolution: '4K (3840×2160)',
        network: '1x 10/100 Ethernet',
        power: 'PoE+ (25.5W)',
        range: '30m IR range'
      },
      ports: [
        { id: 'p1', name: 'ETH1', type: 'ethernet', status: 'connected', switchPort: 'Gi3/0/15', switchName: 'SW-PROD-01' },
        { id: 'p2', name: 'PWR1', type: 'power', status: 'connected', switchPort: 'PoE-15', switchName: 'SW-PROD-01' }
      ],
      lastSeen: '2024-01-20T14:28:00Z',
      ipAddress: '10.0.3.45',
      macAddress: '64:32:A8:78:90:12',
      notes: 'Monitoring palet quality on line A'
    },
    {
      id: 'ws-005',
      type: 'Intel NUC',
      serialNumber: 'NUC-8i7BEH-5E6F7G8',
      model: 'NUC8i7BEH',
      manufacturer: 'Intel Corporation',
      status: 'assigned',
      assignedWorkspace: 'Edge Computing Lab',
      assignedUser: 'Mike Johnson',
      location: 'Lab Desk D3',
      specs: {
        cpu: 'Intel Core i7-8559U',
        memory: '32 GB DDR4',
        storage: '1TB NVMe SSD',
        network: '1x Gigabit Ethernet + WiFi 6',
        power: '90W External Adapter'
      },
      ports: [
        { id: 'p1', name: 'ETH1', type: 'ethernet', status: 'connected', switchPort: 'Gi4/0/8', switchName: 'SW-LAB-01' },
        { id: 'p2', name: 'USB1', type: 'usb', status: 'connected' },
        { id: 'p3', name: 'USB2', type: 'usb', status: 'connected' },
        { id: 'p4', name: 'HDMI1', type: 'hdmi', status: 'connected' },
        { id: 'p5', name: 'PWR1', type: 'power', status: 'connected', switchPort: 'AC-LAB-08', switchName: 'UPS-LAB-01' }
      ],
      lastSeen: '2024-01-20T14:32:00Z',
      ipAddress: '10.0.4.12',
      macAddress: '54:B2:03:AB:CD:EF'
    },
    {
      id: 'ws-006',
      type: 'Temperature Sensor',
      serialNumber: 'TEMP-SHT30-9H0I1J2',
      model: 'SHT30-DIS-B',
      manufacturer: 'Sensirion',
      status: 'assigned',
      assignedWorkspace: 'Environmental Monitoring',
      location: 'Server Room A1 - Inlet',
      specs: {
        accuracy: '±0.2°C (temperature)',
        range: '-40°C to +125°C',
        network: 'I2C + Ethernet Bridge',
        power: '3.3V (2.4-5.5V)'
      },
      ports: [
        { id: 'p1', name: 'ETH1', type: 'ethernet', status: 'connected', switchPort: 'Gi5/0/3', switchName: 'SW-ENV-01' },
        { id: 'p2', name: 'PWR1', type: 'power', status: 'connected', switchPort: 'DC-ENV-03', switchName: 'PSU-ENV-01' },
        { id: 'p3', name: 'I2C', type: 'serial', status: 'connected' }
      ],
      lastSeen: '2024-01-20T14:35:00Z',
      ipAddress: '10.0.5.101',
      macAddress: 'A8:61:0A:AE:15:23',
      notes: 'Monitoring server inlet temperature'
    },
    {
      id: 'ws-007',
      type: 'Humidity Sensor',
      serialNumber: 'HUM-DHT22-3K4L5M6',
      model: 'DHT22/AM2302',
      manufacturer: 'Aosong Electronics',
      status: 'unassigned',
      location: 'Storage - Sensor Rack S1',
      specs: {
        accuracy: '±2% RH (humidity)',
        range: '0-100% RH, -40°C to +80°C',
        network: 'Digital + Ethernet Bridge',
        power: '3.3-6V DC'
      },
      ports: [
        { id: 'p1', name: 'ETH1', type: 'ethernet', status: 'disconnected' },
        { id: 'p2', name: 'PWR1', type: 'power', status: 'disconnected' },
        { id: 'p3', name: 'DATA', type: 'serial', status: 'disconnected' }
      ],
      lastSeen: '2024-01-18T09:15:00Z',
      ipAddress: '10.0.5.102',
      macAddress: 'B4:E6:2D:12:89:45'
    }
  ])

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [selectedWorkstation, setSelectedWorkstation] = useState<Workstation | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [assignDialogOpen, setAssignDialogOpen] = useState(false)

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Dell XR12':
      case 'Dell XR800':
      case 'HPE ProLiant':
        return <Computer sx={{ fontSize: '2rem' }} />
      case 'IP Camera':
        return <Videocam sx={{ fontSize: '2rem' }} />
      case 'Intel NUC':
        return <Memory sx={{ fontSize: '2rem' }} />
      case 'Temperature Sensor':
      case 'Humidity Sensor':
        return <Sensors sx={{ fontSize: '2rem' }} />
      default:
        return <DeviceHub sx={{ fontSize: '2rem' }} />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Dell XR12':
        return '#007DB8' // Dell blue
      case 'Dell XR800':
        return '#007DB8' // Dell blue
      case 'HPE ProLiant':
        return '#01A982' // HPE green
      case 'IP Camera':
        return '#FF6B35' // Camera orange
      case 'Intel NUC':
        return '#0071C5' // Intel blue
      case 'Temperature Sensor':
        return '#FF5722' // Temperature red
      case 'Humidity Sensor':
        return '#2196F3' // Humidity blue
      default:
        return '#757575' // Gray
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assigned':
        return 'success'
      case 'unassigned':
        return 'warning'
      case 'maintenance':
        return 'error'
      case 'offline':
        return 'default'
      default:
        return 'default'
    }
  }

  const getPortStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle color="success" fontSize="small" />
      case 'disconnected':
        return <Cancel color="error" fontSize="small" />
      default:
        return <Circle color="disabled" fontSize="small" />
    }
  }

  const filteredWorkstations = workstations.filter(ws => {
    const matchesSearch = ws.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ws.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ws.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (ws.assignedWorkspace && ws.assignedWorkspace.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStatus = statusFilter === 'all' || ws.status === statusFilter
    const matchesType = typeFilter === 'all' || ws.type === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  const handleViewDetails = (workstation: Workstation) => {
    setSelectedWorkstation(workstation)
    setDetailsOpen(true)
  }

  const handleAssignWorkstation = (workstation: Workstation) => {
    setSelectedWorkstation(workstation)
    setAssignDialogOpen(true)
  }

  const getConnectedPortsCount = (ports: Port[]) => {
    return ports.filter(port => port.status === 'connected').length
  }

  const stats = {
    total: workstations.length,
    assigned: workstations.filter(ws => ws.status === 'assigned').length,
    unassigned: workstations.filter(ws => ws.status === 'unassigned').length,
    offline: workstations.filter(ws => ws.status === 'offline').length
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Computer sx={{ color: 'primary.main', fontSize: '3rem' }} />
          <Box>
            <Typography variant="h3" component="h1" fontWeight="bold">
              Workstations
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Manage hardware devices and their workspace assignments
            </Typography>
          </Box>
        </Box>

        {/* Statistics */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={1} sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.50' }}>
              <Typography variant="h4" fontWeight="bold" color="primary.main">
                {stats.total}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Workstations
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={1} sx={{ p: 2, textAlign: 'center', bgcolor: 'success.50' }}>
              <Typography variant="h4" fontWeight="bold" color="success.main">
                {stats.assigned}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Assigned
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={1} sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.50' }}>
              <Typography variant="h4" fontWeight="bold" color="warning.main">
                {stats.unassigned}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Unassigned
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={1} sx={{ p: 2, textAlign: 'center', bgcolor: 'error.50' }}>
              <Typography variant="h4" fontWeight="bold" color="error.main">
                {stats.offline}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Offline
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Search and Filters */}
      <Card elevation={2} sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search workstations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="assigned">Assigned</MenuItem>
                  <MenuItem value="unassigned">Unassigned</MenuItem>
                  <MenuItem value="maintenance">Maintenance</MenuItem>
                  <MenuItem value="offline">Offline</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={typeFilter}
                  label="Type"
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <MenuItem value="all">All Types</MenuItem>
                  <MenuItem value="Dell XR12">Dell XR12</MenuItem>
                  <MenuItem value="Dell XR800">Dell XR800</MenuItem>
                  <MenuItem value="HPE ProLiant">HPE ProLiant</MenuItem>
                  <MenuItem value="IP Camera">IP Camera</MenuItem>
                  <MenuItem value="Intel NUC">Intel NUC</MenuItem>
                  <MenuItem value="Temperature Sensor">Temperature Sensor</MenuItem>
                  <MenuItem value="Humidity Sensor">Humidity Sensor</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Typography variant="body2" color="text.secondary">
                {filteredWorkstations.length} devices found
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Workstations Table */}
      <Card elevation={2}>
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.50' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>Device</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Serial Number</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Assignment</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Location</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Ports</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredWorkstations.map((workstation) => (
                  <TableRow key={workstation.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                          sx={{
                            bgcolor: getTypeColor(workstation.type),
                            width: 48,
                            height: 48
                          }}
                        >
                          {getTypeIcon(workstation.type)}
                        </Avatar>
                        <Box>
                          <Typography variant="body1" fontWeight="medium">
                            {workstation.model}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {workstation.manufacturer}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={workstation.type}
                        size="small"
                        variant="outlined"
                        sx={{ fontWeight: 'medium' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontFamily="monospace">
                        {workstation.serialNumber}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={workstation.status}
                        color={getStatusColor(workstation.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {workstation.assignedWorkspace ? (
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {workstation.assignedWorkspace}
                          </Typography>
                          {workstation.assignedUser && (
                            <Typography variant="caption" color="text.secondary">
                              {workstation.assignedUser}
                            </Typography>
                          )}
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Unassigned
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {workstation.location}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Badge
                          badgeContent={getConnectedPortsCount(workstation.ports)}
                          color="success"
                          max={99}
                        >
                          <Cable />
                        </Badge>
                        <Typography variant="caption" color="text.secondary">
                          {getConnectedPortsCount(workstation.ports)}/{workstation.ports.length}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => handleViewDetails(workstation)}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Assign Workspace">
                          <IconButton
                            size="small"
                            onClick={() => handleAssignWorkstation(workstation)}
                            color={workstation.status === 'unassigned' ? 'primary' : 'default'}
                          >
                            <AssignmentIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Configure">
                          <IconButton size="small">
                            <Settings />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {selectedWorkstation && (
              <>
                <Avatar
                  sx={{
                    bgcolor: getTypeColor(selectedWorkstation.type),
                    width: 48,
                    height: 48
                  }}
                >
                  {getTypeIcon(selectedWorkstation.type)}
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    {selectedWorkstation.model}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedWorkstation.serialNumber}
                  </Typography>
                </Box>
              </>
            )}
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedWorkstation && (
            <Box>
              {/* Specifications */}
              <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mt: 2 }}>
                Specifications
              </Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                {Object.entries(selectedWorkstation.specs).map(([key, value]) => (
                  <Grid item xs={12} sm={6} key={key}>
                    <Paper elevation={1} sx={{ p: 2 }}>
                      <Typography variant="caption" color="text.secondary" textTransform="uppercase">
                        {key}
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {value}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>

              {/* Port Mapping */}
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Port Mapping
              </Typography>
              <TableContainer component={Paper} elevation={1}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'grey.50' }}>
                      <TableCell>Port</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Switch Connection</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedWorkstation.ports.map((port) => (
                      <TableRow key={port.id}>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {port.name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={port.type} size="small" variant="outlined" />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {getPortStatusIcon(port.status)}
                            <Typography variant="body2">
                              {port.status}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          {port.switchPort && port.switchName ? (
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                {port.switchName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {port.switchPort}
                              </Typography>
                            </Box>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              Not connected
                            </Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Network Info */}
              {selectedWorkstation.ipAddress && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Network Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Paper elevation={1} sx={{ p: 2 }}>
                        <Typography variant="caption" color="text.secondary">
                          IP ADDRESS
                        </Typography>
                        <Typography variant="body2" fontWeight="medium" fontFamily="monospace">
                          {selectedWorkstation.ipAddress}
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Paper elevation={1} sx={{ p: 2 }}>
                        <Typography variant="caption" color="text.secondary">
                          MAC ADDRESS
                        </Typography>
                        <Typography variant="body2" fontWeight="medium" fontFamily="monospace">
                          {selectedWorkstation.macAddress}
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                </Box>
              )}

              {/* Notes */}
              {selectedWorkstation.notes && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Notes
                  </Typography>
                  <Paper elevation={1} sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <Typography variant="body2">
                      {selectedWorkstation.notes}
                    </Typography>
                  </Paper>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Assignment Dialog */}
      <Dialog
        open={assignDialogOpen}
        onClose={() => setAssignDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Assign Workstation</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Workspace</InputLabel>
              <Select label="Workspace">
                <MenuItem value="ai-research">AI Research Project</MenuItem>
                <MenuItem value="web-dev">Web Development</MenuItem>
                <MenuItem value="mobile-app">Mobile App Development</MenuItem>
                <MenuItem value="edge-computing">Edge Computing Lab</MenuItem>
                <MenuItem value="env-monitoring">Environmental Monitoring</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Assigned User"
              placeholder="Enter user email"
              sx={{ mb: 3 }}
            />
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Notes"
              placeholder="Assignment notes..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setAssignDialogOpen(false)}>
            Assign
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}