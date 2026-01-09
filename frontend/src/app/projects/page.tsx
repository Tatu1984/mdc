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
  InputAdornment,
  Tooltip,
  Badge,
  TablePagination,
  TableSortLabel,
  Menu,
  ListItemIcon,
  ListItemText,
  Divider,
  List,
  ListItem,
  ListItemButton,
  Checkbox,
  Switch,
  FormControlLabel
} from '@mui/material'
import AuthGuard from '@/components/AuthGuard'
import {
  Business,
  Search,
  Add,
  Edit,
  Delete,
  Visibility,
  MoreVert,
  CheckCircle,
  Cancel,
  Circle,
  Folder,
  Group,
  NetworkCheck,
  Router,
  Computer,
  Clear,
  Remove,
  Settings,
  Science,
  LocationOn,
  DataUsage
} from '@mui/icons-material'
import Link from 'next/link'

interface ProjectVirtualNetwork {
  id: string
  name: string
  subnet: string
  vlanId: number
  description?: string
}

interface Testbed {
  id: string
  name: string
  location: string
  status: 'online' | 'offline' | 'maintenance'
}

interface Workspace {
  id: string
  name: string
  description: string
  status: 'active' | 'inactive' | 'maintenance'
  createdDate: string
  vmCount: number
  projectId?: string
  assignedPVNs?: string[] // Array of PVN IDs assigned to this workspace
  hasVirtualNetwork?: boolean // Whether workspace has virtual network access
  testbedId: string
  testbedName: string
}

interface Project {
  id: string
  name: string
  description: string
  status: 'active' | 'inactive' | 'planning'
  createdDate: string
  owner: string
  workspaces: string[] // workspace IDs
  projectVirtualNetworks: ProjectVirtualNetwork[] // Array of PVNs
  virtualNetwork?: ProjectVirtualNetwork // Optional single virtual network (legacy)
  totalVMs: number
}

export default function ProjectsPage() {
  const [testbeds] = useState<Testbed[]>([
    {
      id: 'tb-001',
      name: 'Main Data Center',
      location: 'Building A - Floor 1',
      status: 'online'
    },
    {
      id: 'tb-002',
      name: 'Production Floor Lab',
      location: 'Building B - Production',
      status: 'online'
    },
    {
      id: 'tb-003',
      name: 'Edge Computing Lab',
      location: 'Building C - Research',
      status: 'online'
    },
    {
      id: 'tb-004',
      name: 'Remote Development',
      location: 'Building D - Remote',
      status: 'maintenance'
    }
  ])

  const [projects, setProjects] = useState<Project[]>([
    {
      id: 'proj-001',
      name: 'AI Research Initiative',
      description: 'Machine learning and AI development project with multiple research workspaces',
      status: 'active',
      createdDate: '2024-01-15',
      owner: 'Dr. Sarah Johnson',
      workspaces: ['ws-001', 'ws-004'],
      projectVirtualNetworks: [
        {
          id: 'pvn-001',
          name: 'AI-Research-PVN',
          subnet: '10.100.0.0/24',
          vlanId: 100,
          description: 'Dedicated network for AI research workspaces'
        },
        {
          id: 'pvn-002',
          name: 'AI-Training-PVN',
          subnet: '10.101.0.0/24',
          vlanId: 101,
          description: 'High-performance network for ML training'
        }
      ],
      totalVMs: 12
    },
    {
      id: 'proj-002',
      name: 'Production Quality Control',
      description: 'Automated quality control system for production line monitoring',
      status: 'active',
      createdDate: '2024-01-10',
      owner: 'Mike Chen',
      workspaces: ['ws-002', 'ws-003'],
      projectVirtualNetworks: [
        {
          id: 'pvn-003',
          name: 'Production-QC-PVN',
          subnet: '10.200.0.0/24',
          vlanId: 200,
          description: 'Network for production quality control systems'
        }
      ],
      totalVMs: 8
    },
    {
      id: 'proj-003',
      name: 'Edge Computing Lab',
      description: 'Edge computing research and development',
      status: 'planning',
      createdDate: '2024-01-20',
      owner: 'Dr. Alex Rodriguez',
      workspaces: ['ws-005'],
      projectVirtualNetworks: [],
      totalVMs: 3
    }
  ])

  const [workspaces] = useState<Workspace[]>([
    {
      id: 'ws-001',
      name: 'AI Research Project',
      description: 'Primary AI research and development workspace',
      status: 'active',
      createdDate: '2024-01-15',
      vmCount: 8,
      projectId: 'proj-001',
      assignedPVNs: ['pvn-001'],
      testbedId: 'tb-001',
      testbedName: 'Main Data Center'
    },
    {
      id: 'ws-002',
      name: 'Web Development',
      description: 'Web application development and testing',
      status: 'active',
      createdDate: '2024-01-12',
      vmCount: 5,
      projectId: 'proj-002',
      assignedPVNs: ['pvn-003'],
      testbedId: 'tb-001',
      testbedName: 'Main Data Center'
    },
    {
      id: 'ws-003',
      name: 'Pallet Defect Detection',
      description: 'Computer vision for pallet quality detection',
      status: 'active',
      createdDate: '2024-01-10',
      vmCount: 3,
      projectId: 'proj-002',
      assignedPVNs: ['pvn-003'],
      testbedId: 'tb-002',
      testbedName: 'Production Floor Lab'
    },
    {
      id: 'ws-004',
      name: 'ML Training Environment',
      description: 'Machine learning model training and validation',
      status: 'active',
      createdDate: '2024-01-18',
      vmCount: 4,
      projectId: 'proj-001',
      assignedPVNs: ['pvn-001', 'pvn-002'],
      testbedId: 'tb-003',
      testbedName: 'Edge Computing Lab'
    },
    {
      id: 'ws-005',
      name: 'Edge Computing Lab',
      description: 'Edge computing research and development',
      status: 'active',
      createdDate: '2024-01-20',
      vmCount: 3,
      projectId: 'proj-003',
      assignedPVNs: [],
      testbedId: 'tb-003',
      testbedName: 'Edge Computing Lab'
    },
    {
      id: 'ws-006',
      name: 'Standalone Testing',
      description: 'Independent testing workspace',
      status: 'active',
      createdDate: '2024-01-22',
      vmCount: 2,
      assignedPVNs: [],
      testbedId: 'tb-001',
      testbedName: 'Main Data Center'
    },
    {
      id: 'ws-007',
      name: 'Remote Development Env',
      description: 'Remote development and testing workspace',
      status: 'inactive',
      createdDate: '2024-01-25',
      vmCount: 1,
      assignedPVNs: [],
      testbedId: 'tb-004',
      testbedName: 'Remote Development'
    }
  ])

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [createProjectOpen, setCreateProjectOpen] = useState(false)
  const [manageWorkspacesOpen, setManageWorkspacesOpen] = useState(false)
  const [manageNetworkOpen, setManageNetworkOpen] = useState(false)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  // New project form state
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    owner: '',
    createWorkspace: false,
    workspaceName: '',
    workspaceDescription: '',
    selectedTestbed: '',
    createVirtualNetwork: false,
    networkName: '',
    subnet: '',
    vlanId: ''
  })

  const [workspaceTestbedFilter, setWorkspaceTestbedFilter] = useState('all')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success'
      case 'inactive':
        return 'warning'
      case 'planning':
        return 'info'
      case 'maintenance':
        return 'error'
      default:
        return 'default'
    }
  }

  const filteredProjects = projects.filter(project => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.owner.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleViewDetails = (project: Project) => {
    // Navigate to project details page
    window.location.href = `/projects/${project.id}`
  }

  const handleManageWorkspaces = (project: Project) => {
    // Navigate to project details page
    window.location.href = `/projects/${project.id}`
  }

  const handleManageNetwork = (project: Project) => {
    // Navigate to project details page
    window.location.href = `/projects/${project.id}`
  }


  const handleRemoveWorkspaceFromProject = (projectId: string, workspaceId: string) => {
    setProjects(projects.map(p =>
      p.id === projectId
        ? { ...p, workspaces: p.workspaces.filter(wsId => wsId !== workspaceId) }
        : p
    ))
  }

  const handleCreateProject = () => {
    // Here you would create the project and optionally workspace
    console.log('Creating project:', newProject)
    setCreateProjectOpen(false)
    setNewProject({
      name: '',
      description: '',
      owner: '',
      createWorkspace: false,
      workspaceName: '',
      workspaceDescription: '',
      selectedTestbed: '',
      createVirtualNetwork: false,
      networkName: '',
      subnet: '',
      vlanId: ''
    })
  }

  const getProjectWorkspaces = (projectId: string) => {
    const project = projects.find(p => p.id === projectId)
    if (!project) return []
    return workspaces.filter(ws => project.workspaces.includes(ws.id))
  }

  const getUnassignedWorkspaces = () => {
    return workspaces.filter(ws => {
      const isUnassigned = !ws.projectId
      const matchesTestbed = workspaceTestbedFilter === 'all' || ws.testbedId === workspaceTestbedFilter
      return isUnassigned && matchesTestbed
    })
  }

  const stats = {
    totalProjects: projects.length,
    activeProjects: projects.filter(p => p.status === 'active').length,
    totalWorkspaces: workspaces.length,
    assignedWorkspaces: workspaces.filter(ws => ws.projectId).length,
    unassignedWorkspaces: workspaces.filter(ws => !ws.projectId).length
  }

  return (
    <AuthGuard>
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Business sx={{ color: 'primary.main', fontSize: '3rem' }} />
          <Box>
            <Typography variant="h3" component="h1" fontWeight="bold">
              Projects
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Manage projects, workspaces, and virtual networks
            </Typography>
          </Box>
        </Box>

        {/* Statistics */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={2.4}>
            <Paper elevation={1} sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.50' }}>
              <Typography variant="h4" fontWeight="bold" color="primary.main">
                {stats.totalProjects}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Projects
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Paper elevation={1} sx={{ p: 2, textAlign: 'center', bgcolor: 'success.50' }}>
              <Typography variant="h4" fontWeight="bold" color="success.main">
                {stats.activeProjects}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active Projects
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Paper elevation={1} sx={{ p: 2, textAlign: 'center', bgcolor: 'info.50' }}>
              <Typography variant="h4" fontWeight="bold" color="info.main">
                {stats.totalWorkspaces}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Workspaces
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Paper elevation={1} sx={{ p: 2, textAlign: 'center', bgcolor: 'secondary.50' }}>
              <Typography variant="h4" fontWeight="bold" color="secondary.main">
                {stats.assignedWorkspaces}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Assigned Workspaces
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Paper elevation={1} sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.50' }}>
              <Typography variant="h4" fontWeight="bold" color="warning.main">
                {stats.unassignedWorkspaces}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Unassigned Workspaces
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
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                  endAdornment: searchTerm && (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setSearchTerm('')}>
                        <Clear />
                      </IconButton>
                    </InputAdornment>
                  )
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
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                  <MenuItem value="planning">Planning</MenuItem>
                  <MenuItem value="maintenance">Maintenance</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={5}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">
                  {filteredProjects.length} projects found
                </Typography>
                <Button
                  startIcon={<Add />}
                  variant="contained"
                  onClick={() => setCreateProjectOpen(true)}
                >
                  Create Project
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Projects Table */}
      <Card elevation={2}>
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.50' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>Project</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Owner</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Created Date</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Workspaces</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Project Virtual Networks</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredProjects.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((project) => (
                  <TableRow key={project.id} hover>
                    <TableCell>
                      <Typography
                        variant="body1"
                        fontWeight="medium"
                        component={Link}
                        href={`/projects/${project.id}`}
                        sx={{
                          color: 'primary.main',
                          textDecoration: 'none',
                          '&:hover': {
                            textDecoration: 'underline'
                          }
                        }}
                      >
                        {project.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={project.status}
                        color={getStatusColor(project.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {project.owner}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(project.createdDate).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Badge
                          badgeContent={project.workspaces.length}
                          color="primary"
                          max={99}
                        >
                          <Folder />
                        </Badge>
                        <Typography variant="caption" color="text.secondary">
                          {project.workspaces.length} workspace{project.workspaces.length !== 1 ? 's' : ''}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Badge
                          badgeContent={project.projectVirtualNetworks.length}
                          color={project.projectVirtualNetworks.length > 0 ? "success" : "default"}
                          max={99}
                        >
                          <NetworkCheck color={project.projectVirtualNetworks.length > 0 ? "success" : "disabled"} />
                        </Badge>
                        <Typography variant="caption" color="text.secondary">
                          {project.projectVirtualNetworks.length} PVN{project.projectVirtualNetworks.length !== 1 ? 's' : ''}
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredProjects.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10))
              setPage(0)
            }}
          />
        </CardContent>
      </Card>


      {/* Project Details Dialog */}
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Business />
            <Box>
              <Typography variant="h6" fontWeight="bold">
                {selectedProject?.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Project Details
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedProject && (
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper elevation={1} sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      PROJECT INFORMATION
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Name:</strong> {selectedProject.name}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Status:</strong> {selectedProject.status}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Owner:</strong> {selectedProject.owner}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Created:</strong> {new Date(selectedProject.createdDate).toLocaleDateString()}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Description:</strong> {selectedProject.description}
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Paper elevation={1} sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      WORKSPACES ({selectedProject.workspaces.length})
                    </Typography>
                    {getProjectWorkspaces(selectedProject.id).map(workspace => (
                      <Box key={workspace.id} sx={{ mb: 1, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="body2" fontWeight="medium">
                            {workspace.name}
                          </Typography>
                          <Chip
                            size="small"
                            icon={<Science sx={{ fontSize: '14px !important' }} />}
                            label={workspace.testbedName}
                            variant="outlined"
                            sx={{
                              fontSize: '0.75rem',
                              height: '20px',
                              '& .MuiChip-label': { px: 1 }
                            }}
                          />
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {workspace.vmCount} VMs • {workspace.status}
                        </Typography>
                      </Box>
                    ))}
                  </Paper>
                </Grid>

                {selectedProject.virtualNetwork && (
                  <Grid item xs={12}>
                    <Paper elevation={1} sx={{ p: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        VIRTUAL NETWORK
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong>Network Name:</strong> {selectedProject.virtualNetwork.name}
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong>Subnet:</strong> {selectedProject.virtualNetwork.subnet}
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong>VLAN ID:</strong> {selectedProject.virtualNetwork.vlanId}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Description:</strong> {selectedProject.virtualNetwork.description}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Typography variant="body2" sx={{ mb: 1, fontWeight: 'medium' }}>
                            <strong>Connected Testbeds:</strong>
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {Array.from(new Set(getProjectWorkspaces(selectedProject.id).map(ws => ws.testbedName))).map(testbedName => (
                              <Chip
                                key={testbedName}
                                size="small"
                                icon={<Science sx={{ fontSize: '14px !important' }} />}
                                label={testbedName}
                                variant="filled"
                                color="primary"
                                sx={{
                                  fontSize: '0.75rem',
                                  height: '22px'
                                }}
                              />
                            ))}
                          </Box>
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                            Network spans across {Array.from(new Set(getProjectWorkspaces(selectedProject.id).map(ws => ws.testbedName))).length} testbed{Array.from(new Set(getProjectWorkspaces(selectedProject.id).map(ws => ws.testbedName))).length !== 1 ? 's' : ''}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Create Project Dialog */}
      <Dialog
        open={createProjectOpen}
        onClose={() => setCreateProjectOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Create New Project</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Project Name"
                  value={newProject.name}
                  onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Project Owner"
                  value={newProject.owner}
                  onChange={(e) => setNewProject({...newProject, owner: e.target.value})}
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Project Description"
                  value={newProject.description}
                  onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                  sx={{ mb: 3 }}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <FormControlLabel
              control={
                <Checkbox
                  checked={newProject.createWorkspace}
                  onChange={(e) => setNewProject({...newProject, createWorkspace: e.target.checked})}
                />
              }
              label="Create workspace with this project"
            />

            {newProject.createWorkspace && (
              <Box sx={{ ml: 4, mt: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Workspace Name"
                      value={newProject.workspaceName}
                      onChange={(e) => setNewProject({...newProject, workspaceName: e.target.value})}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Workspace Description"
                      value={newProject.workspaceDescription}
                      onChange={(e) => setNewProject({...newProject, workspaceDescription: e.target.value})}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                      <InputLabel>Testbed</InputLabel>
                      <Select
                        value={newProject.selectedTestbed}
                        label="Testbed"
                        onChange={(e) => setNewProject({...newProject, selectedTestbed: e.target.value})}
                      >
                        {testbeds.filter(tb => tb.status === 'online').map(testbed => (
                          <MenuItem key={testbed.id} value={testbed.id}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <LocationOn fontSize="small" />
                              <Box>
                                <Typography variant="body2">{testbed.name}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {testbed.location}
                                </Typography>
                              </Box>
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Box>
            )}

            <Divider sx={{ my: 3 }} />

            <FormControlLabel
              control={
                <Checkbox
                  checked={newProject.createVirtualNetwork}
                  onChange={(e) => setNewProject({...newProject, createVirtualNetwork: e.target.checked})}
                />
              }
              label="Create virtual network for this project"
            />

            {newProject.createVirtualNetwork && (
              <Box sx={{ ml: 4, mt: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Network Name"
                      value={newProject.networkName}
                      onChange={(e) => setNewProject({...newProject, networkName: e.target.value})}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Subnet"
                      value={newProject.subnet}
                      onChange={(e) => setNewProject({...newProject, subnet: e.target.value})}
                      placeholder="e.g., 10.100.0.0/24"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="VLAN ID"
                      type="number"
                      value={newProject.vlanId}
                      onChange={(e) => setNewProject({...newProject, vlanId: e.target.value})}
                      placeholder="e.g., 100"
                    />
                  </Grid>
                </Grid>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateProjectOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateProject}>
            Create Project
          </Button>
        </DialogActions>
      </Dialog>

      {/* Manage Workspaces Dialog */}
      <Dialog
        open={manageWorkspacesOpen}
        onClose={() => setManageWorkspacesOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Manage Workspaces: {selectedProject?.name}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
              Current Workspaces
            </Typography>

            {selectedProject && getProjectWorkspaces(selectedProject.id).length > 0 ? (
              <List>
                {getProjectWorkspaces(selectedProject.id).map(workspace => (
                  <ListItem key={workspace.id}>
                    <ListItemIcon>
                      <Folder />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body1">{workspace.name}</Typography>
                          <Chip
                            size="small"
                            icon={<LocationOn sx={{ fontSize: '14px !important' }} />}
                            label={workspace.testbedName}
                            variant="outlined"
                            color="primary"
                            sx={{
                              fontSize: '0.75rem',
                              height: '20px',
                              '& .MuiChip-label': { px: 1 }
                            }}
                          />
                        </Box>
                      }
                      secondary={`${workspace.vmCount} VMs • ${workspace.status}`}
                    />
                    <IconButton
                      edge="end"
                      onClick={() => handleRemoveWorkspaceFromProject(selectedProject.id, workspace.id)}
                      color="error"
                    >
                      <Remove />
                    </IconButton>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                No workspaces assigned to this project
              </Typography>
            )}

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, mt: 4 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                Available Workspaces
              </Typography>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Filter by Testbed</InputLabel>
                <Select
                  value={workspaceTestbedFilter}
                  label="Filter by Testbed"
                  onChange={(e) => setWorkspaceTestbedFilter(e.target.value)}
                >
                  <MenuItem value="all">All Testbeds</MenuItem>
                  {testbeds.map(testbed => (
                    <MenuItem key={testbed.id} value={testbed.id}>
                      {testbed.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {getUnassignedWorkspaces().length > 0 ? (
              <List>
                {getUnassignedWorkspaces().map(workspace => (
                  <ListItem key={workspace.id}>
                    <ListItemIcon>
                      <Folder />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body1">{workspace.name}</Typography>
                          <Chip
                            size="small"
                            icon={<LocationOn sx={{ fontSize: '14px !important' }} />}
                            label={workspace.testbedName}
                            variant="outlined"
                            color="secondary"
                            sx={{
                              fontSize: '0.75rem',
                              height: '20px',
                              '& .MuiChip-label': { px: 1 }
                            }}
                          />
                        </Box>
                      }
                      secondary={`${workspace.vmCount} VMs • ${workspace.status}`}
                    />
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => {
                        // Add workspace to project
                        console.log('Adding workspace to project')
                      }}
                    >
                      Add to Project
                    </Button>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No unassigned workspaces available
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setManageWorkspacesOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Manage Network Dialog */}
      <Dialog
        open={manageNetworkOpen}
        onClose={() => setManageNetworkOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Manage Virtual Network: {selectedProject?.name}
        </DialogTitle>
        <DialogContent>
          {selectedProject && (
            <Box sx={{ pt: 2 }}>
              {selectedProject.virtualNetwork ? (
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                    Current Network Configuration
                  </Typography>

                  <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>Network Name:</strong> {selectedProject.virtualNetwork.name}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>Subnet:</strong> {selectedProject.virtualNetwork.subnet}
                        </Typography>
                        <Typography variant="body2">
                          <strong>VLAN ID:</strong> {selectedProject.virtualNetwork.vlanId}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" sx={{ mb: 1, fontWeight: 'medium' }}>
                          <strong>Spanning Testbeds:</strong>
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {Array.from(new Set(getProjectWorkspaces(selectedProject.id).map(ws => ws.testbedName))).map(testbedName => (
                            <Chip
                              key={testbedName}
                              size="small"
                              icon={<LocationOn sx={{ fontSize: '12px !important' }} />}
                              label={testbedName}
                              variant="outlined"
                              color="secondary"
                              sx={{
                                fontSize: '0.7rem',
                                height: '20px'
                              }}
                            />
                          ))}
                        </Box>
                      </Grid>
                    </Grid>
                  </Paper>

                  <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                    Workspace Network Access
                  </Typography>

                  {getProjectWorkspaces(selectedProject.id).map(workspace => (
                    <Box key={workspace.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={workspace.hasVirtualNetwork}
                            onChange={() => {
                              // Toggle network access for workspace
                              console.log('Toggling network access for workspace')
                            }}
                          />
                        }
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2">{workspace.name}</Typography>
                            <Chip
                              size="small"
                              icon={<DataUsage sx={{ fontSize: '12px !important' }} />}
                              label={workspace.testbedName}
                              variant="outlined"
                              color="info"
                              sx={{
                                fontSize: '0.7rem',
                                height: '18px',
                                '& .MuiChip-label': { px: 0.5 }
                              }}
                            />
                          </Box>
                        }
                      />
                    </Box>
                  ))}
                </Box>
              ) : (
                <Box>
                  <Typography variant="body1" sx={{ mb: 3 }}>
                    This project doesn't have a virtual network configured.
                  </Typography>
                  <Button variant="contained" fullWidth>
                    Create Virtual Network
                  </Button>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setManageNetworkOpen(false)}>Close</Button>
          {selectedProject?.virtualNetwork && (
            <Button variant="contained">
              Save Changes
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
    </AuthGuard>
  )
}