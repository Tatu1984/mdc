'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
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
  Menu,
  ListItemIcon,
  ListItemText,
  Divider,
  List,
  ListItem,
  ListItemButton,
  Checkbox,
  Switch,
  FormControlLabel,
  Alert,
  Breadcrumbs,
  Link as MuiLink
} from '@mui/material'
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
  DataUsage,
  ArrowBack,
  Person,
  Save,
  AddCircle,
  Cable,
  Hub,
  Lock,
  LockOpen,
  DeleteForever,
  Warning
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
  totalVMs: number
  locked?: boolean
}

export default function ProjectDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string

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

  const [projects] = useState<Project[]>([
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
      totalVMs: 12,
      locked: false
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
      totalVMs: 8,
      locked: false
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
      totalVMs: 3,
      locked: true
    }
  ])

  const [workspaces, setWorkspaces] = useState<Workspace[]>([
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

  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [addWorkspaceOpen, setAddWorkspaceOpen] = useState(false)
  const [createNetworkOpen, setCreateNetworkOpen] = useState(false)
  const [selectedWorkspaces, setSelectedWorkspaces] = useState<string[]>([])
  const [workspaceFilter, setWorkspaceFilter] = useState('all')
  const [assignPVNOpen, setAssignPVNOpen] = useState(false)
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null)
  const [projectActionsOpen, setProjectActionsOpen] = useState(false)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const [deleteWorkspacesOpen, setDeleteWorkspacesOpen] = useState(false)

  // New network form state
  const [newNetwork, setNewNetwork] = useState({
    name: '',
    subnet: '',
    vlanId: '',
    description: ''
  })

  useEffect(() => {
    // Simulate loading project data
    const foundProject = projects.find(p => p.id === projectId)
    setProject(foundProject || null)
    setLoading(false)
  }, [projectId, projects])

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

  const getProjectWorkspaces = () => {
    if (!project) return []
    return workspaces.filter(ws => project.workspaces.includes(ws.id))
  }

  const getAvailableWorkspaces = () => {
    return workspaces.filter(ws => {
      const isUnassigned = !ws.projectId
      const matchesFilter = workspaceFilter === 'all' || ws.testbedId === workspaceFilter
      return isUnassigned && matchesFilter
    })
  }

  const handleAddWorkspaces = () => {
    if (!project || selectedWorkspaces.length === 0) return

    // Update workspaces to assign them to this project
    setWorkspaces(workspaces.map(ws =>
      selectedWorkspaces.includes(ws.id)
        ? { ...ws, projectId: project.id }
        : ws
    ))

    // Close dialog and reset selection
    setAddWorkspaceOpen(false)
    setSelectedWorkspaces([])
  }

  const handleRemoveWorkspace = (workspaceId: string) => {
    if (!project) return

    setWorkspaces(workspaces.map(ws =>
      ws.id === workspaceId
        ? { ...ws, projectId: undefined }
        : ws
    ))
  }

  const handleCreateNetwork = () => {
    if (!project) return

    const networkData: VirtualNetwork = {
      id: `vnet-${Date.now()}`,
      name: newNetwork.name,
      subnet: newNetwork.subnet,
      vlanId: parseInt(newNetwork.vlanId),
      description: newNetwork.description
    }

    // In a real app, you would update the project with the new network
    console.log('Creating network:', networkData)

    setCreateNetworkOpen(false)
    setNewNetwork({
      name: '',
      subnet: '',
      vlanId: '',
      description: ''
    })
  }

  const handleAssignPVNsToWorkspace = (workspaceId: string, pvnIds: string[]) => {
    setWorkspaces(workspaces.map(ws =>
      ws.id === workspaceId
        ? { ...ws, assignedPVNs: pvnIds }
        : ws
    ))
  }

  const handleToggleProjectLock = () => {
    if (!project) return
    // In a real app, you would update via API
    console.log('Toggling project lock status')
    setProject({ ...project, locked: !project.locked })
  }

  const handleDeleteProject = () => {
    if (!project) return
    // In a real app, you would delete via API
    console.log('Deleting project:', project.id)
    // Navigate back to projects list
    router.push('/projects')
  }

  const handleDeleteAllWorkspaces = () => {
    if (!project) return
    // Remove all workspaces from the project and delete them
    setWorkspaces(workspaces.filter(ws => !project.workspaces.includes(ws.id)))
    console.log('Deleted all workspaces for project:', project.id)
    setDeleteWorkspacesOpen(false)
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Typography>Loading project details...</Typography>
      </Box>
    )
  }

  if (!project) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>Project not found</Typography>
        <Button
          component={Link}
          href="/projects"
          startIcon={<ArrowBack />}
          variant="outlined"
        >
          Back to Projects
        </Button>
      </Box>
    )
  }

  return (
    <Box>
      {/* Header with Breadcrumbs */}
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs sx={{ mb: 2 }}>
          <MuiLink component={Link} href="/projects" color="inherit">
            Projects
          </MuiLink>
          <Typography color="text.primary">{project.name}</Typography>
        </Breadcrumbs>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Business sx={{ color: 'primary.main', fontSize: '3rem' }} />
            <Box>
              <Typography variant="h3" component="h1" fontWeight="bold">
                {project.name}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                <Chip
                  label={project.status}
                  color={getStatusColor(project.status) as any}
                  size="small"
                />
                {project.locked && (
                  <Chip
                    icon={<Lock />}
                    label="Locked"
                    color="warning"
                    size="small"
                    variant="outlined"
                  />
                )}
                <Typography variant="body2" color="text.secondary">
                  Created: {new Date(project.createdDate).toLocaleDateString()}
                </Typography>
              </Box>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              startIcon={<Settings />}
              variant="contained"
              onClick={() => setProjectActionsOpen(true)}
            >
              Project Actions
            </Button>
            <Button
              component={Link}
              href="/projects"
              startIcon={<ArrowBack />}
              variant="outlined"
            >
              Back to Projects
            </Button>
          </Box>
        </Box>
      </Box>

      <Grid container spacing={4}>
        {/* Project Information */}
        <Grid item xs={12} md={4}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Person /> Project Information
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Owner
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {project.owner}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Description
                </Typography>
                <Typography variant="body1">
                  {project.description}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Total VMs
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {project.totalVMs}
                </Typography>
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Connected Testbeds
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {Array.from(new Set(getProjectWorkspaces().map(ws => ws.testbedName))).map(testbedName => (
                    <Chip
                      key={testbedName}
                      size="small"
                      icon={<Science sx={{ fontSize: '14px !important' }} />}
                      label={testbedName}
                      variant="outlined"
                      color="primary"
                      sx={{
                        fontSize: '0.75rem',
                        height: '22px'
                      }}
                    />
                  ))}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Workspaces Section */}
        <Grid item xs={12} md={8}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Folder /> Workspaces ({getProjectWorkspaces().length})
                </Typography>
                <Button
                  startIcon={<Add />}
                  variant="contained"
                  onClick={() => setAddWorkspaceOpen(true)}
                >
                  Add Workspace
                </Button>
              </Box>

              {getProjectWorkspaces().length > 0 ? (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: 'grey.50' }}>
                        <TableCell sx={{ fontWeight: 'bold' }}>Workspace</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Testbed</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>VMs</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Assigned PVNs</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {getProjectWorkspaces().map((workspace) => (
                        <TableRow key={workspace.id} hover>
                          <TableCell>
                            <Box>
                              <Typography variant="body1" fontWeight="medium">
                                {workspace.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {workspace.description}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
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
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={workspace.status}
                              color={getStatusColor(workspace.status) as any}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight="medium">
                              {workspace.vmCount}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {workspace.assignedPVNs && workspace.assignedPVNs.length > 0 ? (
                                workspace.assignedPVNs.map(pvnId => {
                                  const pvn = project.projectVirtualNetworks.find(p => p.id === pvnId)
                                  return pvn ? (
                                    <Chip
                                      key={pvn.id}
                                      size="small"
                                      icon={<Cable sx={{ fontSize: '12px !important' }} />}
                                      label={pvn.name}
                                      variant="filled"
                                      color="success"
                                      sx={{
                                        fontSize: '0.7rem',
                                        height: '20px',
                                        '& .MuiChip-label': { px: 1 }
                                      }}
                                    />
                                  ) : null
                                })
                              ) : (
                                <Typography variant="caption" color="text.secondary">
                                  No PVNs assigned
                                </Typography>
                              )}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Tooltip title="Assign PVNs">
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    setSelectedWorkspace(workspace)
                                    setAssignPVNOpen(true)
                                  }}
                                  color="primary"
                                  disabled={project.projectVirtualNetworks.length === 0}
                                >
                                  <Cable />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Remove from Project">
                                <IconButton
                                  size="small"
                                  onClick={() => handleRemoveWorkspace(workspace.id)}
                                  color="error"
                                >
                                  <Remove />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Alert severity="info">
                  No workspaces assigned to this project. Click "Add Workspace" to get started.
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Project Virtual Networks Section */}
        <Grid item xs={12}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <NetworkCheck /> Project Virtual Networks ({project.projectVirtualNetworks.length})
                </Typography>
                <Button
                  startIcon={<AddCircle />}
                  variant="contained"
                  onClick={() => setCreateNetworkOpen(true)}
                >
                  Create PVN
                </Button>
              </Box>

              {project.projectVirtualNetworks.length > 0 ? (
                <Grid container spacing={3}>
                  {project.projectVirtualNetworks.map((pvn, index) => (
                    <Grid item xs={12} md={6} key={pvn.id}>
                      <Paper elevation={1} sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="subtitle2" color="text.secondary">
                            PVN #{index + 1}
                          </Typography>
                          <Chip
                            size="small"
                            icon={<Cable sx={{ fontSize: '12px !important' }} />}
                            label={`VLAN ${pvn.vlanId}`}
                            variant="outlined"
                            color="primary"
                            sx={{ fontSize: '0.7rem', height: '18px' }}
                          />
                        </Box>
                        <Typography variant="body1" fontWeight="bold" sx={{ mb: 1 }}>
                          {pvn.name}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>Subnet:</strong> {pvn.subnet}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>Description:</strong> {pvn.description}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Connected workspaces: {getProjectWorkspaces().filter(ws => ws.assignedPVNs?.includes(pvn.id)).length}
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                  <Grid item xs={12}>
                    <Paper elevation={1} sx={{ p: 2, bgcolor: 'grey.50' }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        TESTBED SPAN
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1, fontWeight: 'medium' }}>
                        Connected Testbeds:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                        {Array.from(new Set(getProjectWorkspaces().map(ws => ws.testbedName))).map(testbedName => (
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
                      <Typography variant="caption" color="text.secondary">
                        PVNs span across {Array.from(new Set(getProjectWorkspaces().map(ws => ws.testbedName))).length} testbed{Array.from(new Set(getProjectWorkspaces().map(ws => ws.testbedName))).length !== 1 ? 's' : ''}
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              ) : (
                <Alert severity="info">
                  No Project Virtual Networks configured. Create a PVN to enable cross-workspace connectivity.
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Add Workspace Dialog */}
      <Dialog
        open={addWorkspaceOpen}
        onClose={() => setAddWorkspaceOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Add Workspaces to Project</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                Available Workspaces
              </Typography>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Filter by Testbed</InputLabel>
                <Select
                  value={workspaceFilter}
                  label="Filter by Testbed"
                  onChange={(e) => setWorkspaceFilter(e.target.value)}
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

            {getAvailableWorkspaces().length > 0 ? (
              <List>
                {getAvailableWorkspaces().map(workspace => (
                  <ListItem key={workspace.id}>
                    <Checkbox
                      checked={selectedWorkspaces.includes(workspace.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedWorkspaces([...selectedWorkspaces, workspace.id])
                        } else {
                          setSelectedWorkspaces(selectedWorkspaces.filter(id => id !== workspace.id))
                        }
                      }}
                    />
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
                      secondary={`${workspace.vmCount} VMs • ${workspace.status} • ${workspace.description}`}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No unassigned workspaces available for the selected testbed filter.
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddWorkspaceOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleAddWorkspaces}
            disabled={selectedWorkspaces.length === 0}
          >
            Add {selectedWorkspaces.length} Workspace{selectedWorkspaces.length !== 1 ? 's' : ''}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Network Dialog */}
      <Dialog
        open={createNetworkOpen}
        onClose={() => setCreateNetworkOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create Project Virtual Network</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Network Name"
              value={newNetwork.name}
              onChange={(e) => setNewNetwork({...newNetwork, name: e.target.value})}
              sx={{ mb: 2 }}
            />
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={8}>
                <TextField
                  fullWidth
                  label="Subnet"
                  value={newNetwork.subnet}
                  onChange={(e) => setNewNetwork({...newNetwork, subnet: e.target.value})}
                  placeholder="e.g., 10.100.0.0/24"
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label="VLAN ID"
                  type="number"
                  value={newNetwork.vlanId}
                  onChange={(e) => setNewNetwork({...newNetwork, vlanId: e.target.value})}
                  placeholder="e.g., 100"
                />
              </Grid>
            </Grid>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Description"
              value={newNetwork.description}
              onChange={(e) => setNewNetwork({...newNetwork, description: e.target.value})}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateNetworkOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateNetwork}>
            Create PVN
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assign PVN Dialog */}
      <Dialog
        open={assignPVNOpen}
        onClose={() => setAssignPVNOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Assign PVNs to Workspace: {selectedWorkspace?.name}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Select which Project Virtual Networks this workspace should connect to:
            </Typography>

            {project && project.projectVirtualNetworks.length > 0 ? (
              <List>
                {project.projectVirtualNetworks.map((pvn) => (
                  <ListItem key={pvn.id} disablePadding>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={selectedWorkspace?.assignedPVNs?.includes(pvn.id) || false}
                          onChange={(e) => {
                            if (!selectedWorkspace) return
                            const currentPVNs = selectedWorkspace.assignedPVNs || []
                            const newPVNs = e.target.checked
                              ? [...currentPVNs, pvn.id]
                              : currentPVNs.filter(id => id !== pvn.id)

                            setSelectedWorkspace({
                              ...selectedWorkspace,
                              assignedPVNs: newPVNs
                            })
                          }}
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="body1" fontWeight="medium">
                            {pvn.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {pvn.subnet} • VLAN {pvn.vlanId} • {pvn.description}
                          </Typography>
                        </Box>
                      }
                      sx={{ width: '100%' }}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Alert severity="info">
                No PVNs available. Create a PVN first to assign it to workspaces.
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignPVNOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {
              if (selectedWorkspace) {
                handleAssignPVNsToWorkspace(selectedWorkspace.id, selectedWorkspace.assignedPVNs || [])
                setAssignPVNOpen(false)
                setSelectedWorkspace(null)
              }
            }}
          >
            Save Assignments
          </Button>
        </DialogActions>
      </Dialog>

      {/* Project Actions Dialog */}
      <Dialog
        open={projectActionsOpen}
        onClose={() => setProjectActionsOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Settings />
            Project Actions: {project?.name}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Manage project settings and perform administrative actions.
            </Typography>

            <List>
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => {
                    handleToggleProjectLock()
                    setProjectActionsOpen(false)
                  }}
                >
                  <ListItemIcon>
                    {project?.locked ? <LockOpen color="success" /> : <Lock color="warning" />}
                  </ListItemIcon>
                  <ListItemText
                    primary={project?.locked ? "Unlock Project" : "Lock Project"}
                    secondary={project?.locked
                      ? "Allow modifications to project and workspaces"
                      : "Prevent modifications to project and workspaces"
                    }
                  />
                </ListItemButton>
              </ListItem>

              <Divider sx={{ my: 1 }} />

              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => {
                    setProjectActionsOpen(false)
                    setDeleteWorkspacesOpen(true)
                  }}
                  disabled={!project?.workspaces || project.workspaces.length === 0}
                >
                  <ListItemIcon>
                    <DeleteForever color="error" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Delete All Workspaces"
                    secondary={`Remove and delete all ${project?.workspaces?.length || 0} workspaces from this project`}
                  />
                </ListItemButton>
              </ListItem>

              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => {
                    setProjectActionsOpen(false)
                    setConfirmDeleteOpen(true)
                  }}
                  sx={{ color: 'error.main' }}
                >
                  <ListItemIcon>
                    <Delete color="error" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Delete Project"
                    secondary="Permanently delete this project and all associated data"
                  />
                </ListItemButton>
              </ListItem>
            </List>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProjectActionsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Delete Project Dialog */}
      <Dialog
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Warning color="error" />
            Confirm Project Deletion
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="body1" fontWeight="bold">
              This action cannot be undone!
            </Typography>
          </Alert>
          <Typography variant="body1" sx={{ mb: 2 }}>
            You are about to permanently delete the project "<strong>{project?.name}</strong>".
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This will:
          </Typography>
          <Box component="ul" sx={{ mt: 1, mb: 2, pl: 2 }}>
            <Typography component="li" variant="body2">
              Delete the project and all its configuration
            </Typography>
            <Typography component="li" variant="body2">
              Remove all PVN assignments from workspaces
            </Typography>
            <Typography component="li" variant="body2">
              Delete all {project?.projectVirtualNetworks?.length || 0} Project Virtual Networks
            </Typography>
            <Typography component="li" variant="body2">
              Unassign {project?.workspaces?.length || 0} workspaces (workspaces will remain but be unassigned)
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              handleDeleteProject()
              setConfirmDeleteOpen(false)
            }}
          >
            Delete Project
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete All Workspaces Dialog */}
      <Dialog
        open={deleteWorkspacesOpen}
        onClose={() => setDeleteWorkspacesOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <DeleteForever color="error" />
            Delete All Workspaces
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="body1" fontWeight="bold">
              This will permanently delete all workspaces!
            </Typography>
          </Alert>
          <Typography variant="body1" sx={{ mb: 2 }}>
            You are about to delete all <strong>{project?.workspaces?.length || 0} workspaces</strong> from project "{project?.name}".
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This will:
          </Typography>
          <Box component="ul" sx={{ mt: 1, mb: 2, pl: 2 }}>
            <Typography component="li" variant="body2">
              Permanently delete all workspace data and VMs
            </Typography>
            <Typography component="li" variant="body2">
              Remove all PVN assignments
            </Typography>
            <Typography component="li" variant="body2">
              Cannot be undone
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteWorkspacesOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteAllWorkspaces}
          >
            Delete All Workspaces
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}