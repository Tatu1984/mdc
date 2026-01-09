'use client'

import { useState } from 'react'
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Grid,
  Collapse,
  Alert
} from '@mui/material'
import {
  Add,
  Delete,
  NetworkCheck,
  Check,
  Close,
  ToggleOn,
  ToggleOff,
  Cable,
  Router,
  TrendingUp
} from '@mui/icons-material'
import AuthGuard from '@/components/AuthGuard'

interface Port {
  id: number
  name: string
  number: number
  protocol: string
  status: 'active' | 'inactive'
  service: string
  connected: boolean
  switchId: number
}

export default function PortsPage() {
  const [ports, setPorts] = useState<Port[]>([
    { id: 1, name: 'HTTP', number: 80, protocol: 'TCP', status: 'active', service: 'Web Server', connected: true, switchId: 1 },
    { id: 2, name: 'HTTPS', number: 443, protocol: 'TCP', status: 'active', service: 'Secure Web', connected: true, switchId: 1 },
    { id: 3, name: 'SSH', number: 22, protocol: 'TCP', status: 'active', service: 'Remote Access', connected: true, switchId: 2 },
    { id: 4, name: 'PostgreSQL', number: 5432, protocol: 'TCP', status: 'active', service: 'Database', connected: false, switchId: 2 },
    { id: 5, name: 'Redis', number: 6379, protocol: 'TCP', status: 'inactive', service: 'Cache', connected: false, switchId: 3 },
    { id: 6, name: 'FTP', number: 21, protocol: 'TCP', status: 'active', service: 'File Transfer', connected: true, switchId: 1 },
    { id: 7, name: 'DNS', number: 53, protocol: 'UDP', status: 'active', service: 'Domain Name', connected: true, switchId: 2 },
    { id: 8, name: 'SMTP', number: 25, protocol: 'TCP', status: 'inactive', service: 'Email', connected: false, switchId: 3 },
  ])

  const [showAddForm, setShowAddForm] = useState(false)
  const [newPort, setNewPort] = useState({
    name: '',
    number: '',
    protocol: 'TCP',
    service: ''
  })

  const handleAddPort = () => {
    if (newPort.name && newPort.number && newPort.service) {
      setPorts([...ports, {
        id: ports.length + 1,
        name: newPort.name,
        number: parseInt(newPort.number),
        protocol: newPort.protocol,
        status: 'inactive',
        service: newPort.service,
        connected: false,
        switchId: 1
      }])
      setNewPort({ name: '', number: '', protocol: 'TCP', service: '' })
      setShowAddForm(false)
    }
  }

  const togglePortStatus = (id: number) => {
    setPorts(ports.map(port =>
      port.id === id
        ? { ...port, status: port.status === 'active' ? 'inactive' : 'active' }
        : port
    ))
  }

  const deletePort = (id: number) => {
    setPorts(ports.filter(port => port.id !== id))
  }

  const totalPorts = ports.length
  const connectedPorts = ports.filter(port => port.connected).length
  const availablePorts = totalPorts - connectedPorts
  const totalSwitches = Array.from(new Set(ports.map(port => port.switchId))).length

  return (
    <AuthGuard>
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <NetworkCheck sx={{ color: 'primary.main' }} />
          <Typography variant="h4" component="h1" fontWeight="bold">
            Port Management
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setShowAddForm(true)}
          disabled={showAddForm}
        >
          Add Port
        </Button>
      </Box>

      {/* Port Statistics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={2} sx={{ p: 3, textAlign: 'center', bgcolor: 'primary.50' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
              <NetworkCheck sx={{ color: 'primary.main', fontSize: 32 }} />
            </Box>
            <Typography variant="h4" fontWeight="bold" color="primary.main" gutterBottom>
              {totalPorts}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Ports
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={2} sx={{ p: 3, textAlign: 'center', bgcolor: 'success.50' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
              <Cable sx={{ color: 'success.main', fontSize: 32 }} />
            </Box>
            <Typography variant="h4" fontWeight="bold" color="success.main" gutterBottom>
              {connectedPorts}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Connected/Utilized
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={2} sx={{ p: 3, textAlign: 'center', bgcolor: 'warning.50' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
              <TrendingUp sx={{ color: 'warning.main', fontSize: 32 }} />
            </Box>
            <Typography variant="h4" fontWeight="bold" color="warning.main" gutterBottom>
              {availablePorts}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Available Ports
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={2} sx={{ p: 3, textAlign: 'center', bgcolor: 'secondary.50' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
              <Router sx={{ color: 'secondary.main', fontSize: 32 }} />
            </Box>
            <Typography variant="h4" fontWeight="bold" color="secondary.main" gutterBottom>
              {totalSwitches}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Network Switches
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Collapse in={showAddForm}>
        <Card elevation={2} sx={{ mb: 3, bgcolor: 'primary.50' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom color="primary.main">
              Add New Port
            </Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6} md={2.4}>
                <TextField
                  fullWidth
                  label="Port Name"
                  value={newPort.name}
                  onChange={(e) => setNewPort({...newPort, name: e.target.value})}
                  placeholder="e.g., HTTP"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                <TextField
                  fullWidth
                  type="number"
                  label="Port Number"
                  value={newPort.number}
                  onChange={(e) => setNewPort({...newPort, number: e.target.value})}
                  placeholder="e.g., 80"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                <FormControl fullWidth>
                  <InputLabel>Protocol</InputLabel>
                  <Select
                    value={newPort.protocol}
                    label="Protocol"
                    onChange={(e) => setNewPort({...newPort, protocol: e.target.value})}
                  >
                    <MenuItem value="TCP">TCP</MenuItem>
                    <MenuItem value="UDP">UDP</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                <TextField
                  fullWidth
                  label="Service"
                  value={newPort.service}
                  onChange={(e) => setNewPort({...newPort, service: e.target.value})}
                  placeholder="e.g., Web Server"
                />
              </Grid>
              <Grid item xs={12} sm={12} md={2.4}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<Check />}
                    onClick={handleAddPort}
                    disabled={!newPort.name || !newPort.number || !newPort.service}
                  >
                    Add
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<Close />}
                    onClick={() => setShowAddForm(false)}
                  >
                    Cancel
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Collapse>

      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.50' }}>
              <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Port Number</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Protocol</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Service</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Connection</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Switch</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ports.map((port) => (
              <TableRow key={port.id} hover>
                <TableCell>
                  <Typography variant="body1" fontWeight="medium">
                    {port.name}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontFamily="monospace">
                    {port.number}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={port.protocol}
                    size="small"
                    color={port.protocol === 'TCP' ? 'primary' : 'secondary'}
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {port.service}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={port.connected ? 'Connected' : 'Disconnected'}
                    color={port.connected ? 'success' : 'default'}
                    size="small"
                    icon={port.connected ? <Cable /> : <Close />}
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={`Switch ${port.switchId}`}
                    color="primary"
                    size="small"
                    variant="outlined"
                    icon={<Router />}
                  />
                </TableCell>
                <TableCell>
                  <Button
                    onClick={() => togglePortStatus(port.id)}
                    startIcon={port.status === 'active' ? <ToggleOn /> : <ToggleOff />}
                    color={port.status === 'active' ? 'success' : 'error'}
                    variant="outlined"
                    size="small"
                  >
                    {port.status}
                  </Button>
                </TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => deletePort(port.id)}
                    color="error"
                    size="small"
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {ports.length === 0 && (
        <Alert severity="info" sx={{ mt: 2 }}>
          No ports configured. Click "Add Port" to get started.
        </Alert>
      )}
    </Box>
    </AuthGuard>
  )
}