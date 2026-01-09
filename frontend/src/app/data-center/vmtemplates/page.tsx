'use client'

import { useState } from 'react'
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  Chip,
  IconButton,
  Avatar,
  Collapse,
  Divider,
  Stack,
  InputAdornment,
  Tabs,
  Tab
} from '@mui/material'
import {
  Computer,
  Add,
  CloudDownload,
  ContentCopy,
  Delete,
  DesktopWindows,
  Memory,
  Storage,
  Speed,
  Search,
  FilterList,
  Edit,
  Visibility,
  Security,
  SmartToy,
  PhotoCamera,
  Code,
  DataObject
} from '@mui/icons-material'
import AuthGuard from '@/components/AuthGuard'

interface VMTemplate {
  id: number
  name: string
  description: string
  osType: 'ubuntu' | 'windows' | 'pfsense' | 'ai-application' | 'palet-defect-detection' | 'centos' | 'kubernetes'
  memory: string
  disks: {
    primary: string
    secondary?: string
  }
  cpu: {
    cores: number
    type: string
  }
  cpuType: string
  baseImageName: string
  version: string
  created: string
  downloads: number
  size: string
  category: 'infrastructure' | 'development' | 'security' | 'ai-ml' | 'specialized'
  status: 'active' | 'deprecated' | 'beta'
}

export default function VMTemplatesPage() {
  const [templates] = useState<VMTemplate[]>([
    {
      id: 1,
      name: 'Ubuntu Server 22.04 LTS',
      description: 'Latest Ubuntu Server with Docker, Git, and common development tools pre-installed. Perfect for web applications and microservices.',
      osType: 'ubuntu',
      memory: '4 GB',
      disks: {
        primary: '20 GB SSD',
        secondary: '50 GB HDD'
      },
      cpu: {
        cores: 2,
        type: 'Intel Xeon E5-2686v4'
      },
      cpuType: 'Intel Xeon E5-2686v4',
      baseImageName: 'ubuntu-22.04-server-amd64',
      version: '22.04.3 LTS',
      created: '2024-01-15',
      downloads: 245,
      size: '2.1 GB',
      category: 'infrastructure',
      status: 'active'
    },
    {
      id: 2,
      name: 'Windows Server 2022',
      description: 'Windows Server 2022 Standard with IIS, .NET Framework 4.8, SQL Server Express, and PowerShell Core.',
      osType: 'windows',
      memory: '8 GB',
      disks: {
        primary: '60 GB SSD',
        secondary: '100 GB HDD'
      },
      cpu: {
        cores: 4,
        type: 'Intel Xeon Platinum 8175M'
      },
      cpuType: 'Intel Xeon Platinum 8175M',
      baseImageName: 'windows-server-2022-standard',
      version: '2022 Standard',
      created: '2024-01-10',
      downloads: 156,
      size: '8.5 GB',
      category: 'infrastructure',
      status: 'active'
    },
    {
      id: 3,
      name: 'pfSense Firewall',
      description: 'Enterprise-grade firewall and router based on FreeBSD. Includes VPN, load balancing, and traffic shaping capabilities.',
      osType: 'pfsense',
      memory: '2 GB',
      disks: {
        primary: '8 GB SSD'
      },
      cpu: {
        cores: 2,
        type: 'Intel Xeon E5-2676v3'
      },
      cpuType: 'Intel Xeon E5-2676v3',
      baseImageName: 'pfsense-2.7.2-release',
      version: '2.7.2-RELEASE',
      created: '2024-01-12',
      downloads: 89,
      size: '1.2 GB',
      category: 'security',
      status: 'active'
    },
    {
      id: 4,
      name: 'AI Research Platform',
      description: 'Ubuntu 20.04 with TensorFlow, PyTorch, Jupyter Lab, CUDA drivers, and Python scientific libraries for machine learning research.',
      osType: 'ai-application',
      memory: '16 GB',
      disks: {
        primary: '50 GB SSD',
        secondary: '200 GB NVMe'
      },
      cpu: {
        cores: 8,
        type: 'Intel Xeon Platinum 8275CL'
      },
      cpuType: 'Intel Xeon Platinum 8275CL',
      baseImageName: 'ubuntu-20.04-ai-research',
      version: '2024.1',
      created: '2024-01-08',
      downloads: 178,
      size: '12.3 GB',
      category: 'ai-ml',
      status: 'active'
    },
    {
      id: 5,
      name: 'Palet Defect Detection',
      description: 'Specialized computer vision system for automated palet quality inspection using OpenCV, YOLO, and custom ML models.',
      osType: 'palet-defect-detection',
      memory: '12 GB',
      disks: {
        primary: '40 GB SSD',
        secondary: '100 GB HDD'
      },
      cpu: {
        cores: 6,
        type: 'Intel Xeon Gold 6254'
      },
      cpuType: 'Intel Xeon Gold 6254',
      baseImageName: 'ubuntu-18.04-cv-detection',
      version: '3.2.1',
      created: '2024-01-20',
      downloads: 67,
      size: '8.7 GB',
      category: 'specialized',
      status: 'active'
    },
    {
      id: 6,
      name: 'CentOS Stream 9',
      description: 'Enterprise Linux distribution with RHEL compatibility. Includes development tools, Docker, and system monitoring.',
      osType: 'centos',
      memory: '4 GB',
      disks: {
        primary: '25 GB SSD'
      },
      cpu: {
        cores: 2,
        type: 'AMD EPYC 7571'
      },
      cpuType: 'AMD EPYC 7571',
      baseImageName: 'centos-stream-9-minimal',
      version: 'Stream 9',
      created: '2024-01-18',
      downloads: 134,
      size: '3.2 GB',
      category: 'infrastructure',
      status: 'active'
    },
    {
      id: 7,
      name: 'Kubernetes Worker Node',
      description: 'Pre-configured Kubernetes worker node with containerd, kubectl, and monitoring agents. Ready for cluster deployment.',
      osType: 'kubernetes',
      memory: '8 GB',
      disks: {
        primary: '40 GB SSD',
        secondary: '80 GB HDD'
      },
      cpu: {
        cores: 4,
        type: 'Intel Xeon E5-2686v4'
      },
      cpuType: 'Intel Xeon E5-2686v4',
      baseImageName: 'k8s-worker-node-v1.28',
      version: 'v1.28.4',
      created: '2024-01-22',
      downloads: 203,
      size: '4.8 GB',
      category: 'development',
      status: 'active'
    }
  ])

  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [osFilter, setOsFilter] = useState('all')
  const [showCreateForm, setShowCreateForm] = useState(false)

  const getTemplateIcon = (osType: string) => {
    const iconProps = { sx: { fontSize: '2rem' } }

    switch (osType) {
      case 'ubuntu':
      case 'centos':
        return <DataObject {...iconProps} />
      case 'windows':
        return <DesktopWindows {...iconProps} />
      case 'pfsense':
        return <Security {...iconProps} />
      case 'ai-application':
        return <SmartToy {...iconProps} />
      case 'palet-defect-detection':
        return <PhotoCamera {...iconProps} />
      case 'kubernetes':
        return <Code {...iconProps} />
      default:
        return <Computer {...iconProps} />
    }
  }

  const getTemplateColor = (osType: string) => {
    switch (osType) {
      case 'ubuntu':
        return '#E95420' // Ubuntu orange
      case 'windows':
        return '#0078D4' // Microsoft blue
      case 'pfsense':
        return '#212121' // Dark gray
      case 'ai-application':
        return '#FF6F00' // AI orange
      case 'palet-defect-detection':
        return '#9C27B0' // Purple
      case 'centos':
        return '#262577' // CentOS blue
      case 'kubernetes':
        return '#326CE5' // Kubernetes blue
      default:
        return '#1976D2' // Default blue
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'infrastructure':
        return 'primary'
      case 'development':
        return 'secondary'
      case 'security':
        return 'error'
      case 'ai-ml':
        return 'warning'
      case 'specialized':
        return 'success'
      default:
        return 'default'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success'
      case 'beta':
        return 'warning'
      case 'deprecated':
        return 'error'
      default:
        return 'default'
    }
  }

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || template.category === categoryFilter
    const matchesOS = osFilter === 'all' || template.osType === osFilter

    return matchesSearch && matchesCategory && matchesOS
  })

  const downloadTemplate = (id: number) => {
    console.log(`Downloading template ${id}`)
  }

  const deleteTemplate = (id: number) => {
    console.log(`Deleting template ${id}`)
  }

  const copyTemplate = (id: number) => {
    console.log(`Copying template ${id}`)
  }

  return (
    <AuthGuard>
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Computer sx={{ color: 'primary.main', fontSize: '2.5rem' }} />
          <Box>
            <Typography variant="h3" component="h1" fontWeight="bold">
              VM Templates
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Create and manage virtual machine templates
            </Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setShowCreateForm(!showCreateForm)}
          size="large"
        >
          Create Template
        </Button>
      </Box>

      {/* Search and Filters */}
      <Card elevation={2} sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search templates..."
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
                <InputLabel>Category</InputLabel>
                <Select
                  value={categoryFilter}
                  label="Category"
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <MenuItem value="all">All Categories</MenuItem>
                  <MenuItem value="infrastructure">Infrastructure</MenuItem>
                  <MenuItem value="development">Development</MenuItem>
                  <MenuItem value="security">Security</MenuItem>
                  <MenuItem value="ai-ml">AI/ML</MenuItem>
                  <MenuItem value="specialized">Specialized</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>OS Type</InputLabel>
                <Select
                  value={osFilter}
                  label="OS Type"
                  onChange={(e) => setOsFilter(e.target.value)}
                >
                  <MenuItem value="all">All OS Types</MenuItem>
                  <MenuItem value="ubuntu">Ubuntu</MenuItem>
                  <MenuItem value="windows">Windows</MenuItem>
                  <MenuItem value="centos">CentOS</MenuItem>
                  <MenuItem value="pfsense">pfSense</MenuItem>
                  <MenuItem value="ai-application">AI Application</MenuItem>
                  <MenuItem value="palet-defect-detection">Palet Detection</MenuItem>
                  <MenuItem value="kubernetes">Kubernetes</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Typography variant="body2" color="text.secondary">
                {filteredTemplates.length} templates found
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Create Form */}
      <Collapse in={showCreateForm}>
        <Card elevation={2} sx={{ mb: 4, bgcolor: 'grey.50' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Create New VM Template
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Template Name"
                  placeholder="e.g., Ubuntu Server 22.04"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Description"
                  placeholder="Brief description of the template"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>OS Type</InputLabel>
                  <Select label="OS Type">
                    <MenuItem value="ubuntu">Ubuntu</MenuItem>
                    <MenuItem value="windows">Windows</MenuItem>
                    <MenuItem value="centos">CentOS</MenuItem>
                    <MenuItem value="pfsense">pfSense</MenuItem>
                    <MenuItem value="ai-application">AI Application</MenuItem>
                    <MenuItem value="palet-defect-detection">Palet Detection</MenuItem>
                    <MenuItem value="kubernetes">Kubernetes</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Memory"
                  placeholder="e.g., 4 GB"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Primary Disk"
                  placeholder="e.g., 20 GB SSD"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="CPU Cores"
                  placeholder="2"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="CPU Type"
                  placeholder="e.g., Intel Xeon E5-2686v4"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Base Image Name"
                  placeholder="e.g., ubuntu-22.04-server-amd64"
                />
              </Grid>
            </Grid>
            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
              <Button variant="contained" color="success">
                Create Template
              </Button>
              <Button
                variant="outlined"
                onClick={() => setShowCreateForm(false)}
              >
                Cancel
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Collapse>

      {/* Templates Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {filteredTemplates.map((template) => (
          <Grid item xs={12} lg={6} xl={4} key={template.id}>
            <Card
              elevation={2}
              sx={{
                height: '100%',
                transition: 'all 0.2s',
                '&:hover': {
                  elevation: 6,
                  transform: 'translateY(-4px)',
                },
              }}
            >
              <CardContent sx={{ pb: 1 }}>
                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar
                      sx={{
                        bgcolor: getTemplateColor(template.osType),
                        width: 56,
                        height: 56
                      }}
                    >
                      {getTemplateIcon(template.osType)}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" component="h3" fontWeight="bold">
                        {template.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {template.version}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Chip
                      label={template.category}
                      color={getCategoryColor(template.category) as any}
                      size="small"
                      variant="outlined"
                    />
                    <Chip
                      label={template.status}
                      color={getStatusColor(template.status) as any}
                      size="small"
                    />
                  </Box>
                </Box>

                {/* Description */}
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 60 }}>
                  {template.description}
                </Typography>

                <Divider sx={{ my: 2 }} />

                {/* Specifications */}
                <Stack spacing={1}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" fontWeight="medium">Memory:</Typography>
                    <Typography variant="body2">{template.memory}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" fontWeight="medium">Primary Disk:</Typography>
                    <Typography variant="body2">{template.disks.primary}</Typography>
                  </Box>
                  {template.disks.secondary && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" fontWeight="medium">Secondary Disk:</Typography>
                      <Typography variant="body2">{template.disks.secondary}</Typography>
                    </Box>
                  )}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" fontWeight="medium">CPU:</Typography>
                    <Typography variant="body2">{template.cpu.cores} cores</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" fontWeight="medium">CPU Type:</Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>{template.cpuType}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" fontWeight="medium">Base Image:</Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.75rem', fontFamily: 'monospace' }}>
                      {template.baseImageName}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" fontWeight="medium">Size:</Typography>
                    <Typography variant="body2">{template.size}</Typography>
                  </Box>
                </Stack>

                <Divider sx={{ my: 2 }} />

                {/* Stats */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" color="text.secondary">
                    {template.downloads} downloads
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Created: {new Date(template.created).toLocaleDateString()}
                  </Typography>
                </Box>
              </CardContent>

              <CardActions sx={{ gap: 1, px: 2, pb: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<CloudDownload />}
                  onClick={() => downloadTemplate(template.id)}
                  sx={{ flex: 1 }}
                >
                  Deploy
                </Button>
                <IconButton
                  color="primary"
                  onClick={() => copyTemplate(template.id)}
                  title="Copy Template"
                >
                  <ContentCopy />
                </IconButton>
                <IconButton color="default" title="View Details">
                  <Visibility />
                </IconButton>
                <IconButton color="default" title="Edit Template">
                  <Edit />
                </IconButton>
                <IconButton
                  color="error"
                  onClick={() => deleteTemplate(template.id)}
                  title="Delete Template"
                >
                  <Delete />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Statistics */}
      <Card elevation={2}>
        <CardContent>
          <Typography variant="h5" component="h2" fontWeight="bold" gutterBottom>
            Template Statistics
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Paper elevation={1} sx={{ p: 3, textAlign: 'center', bgcolor: 'primary.50' }}>
                <Typography variant="h4" fontWeight="bold" color="primary.main" gutterBottom>
                  {templates.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Templates
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper elevation={1} sx={{ p: 3, textAlign: 'center', bgcolor: 'success.50' }}>
                <Typography variant="h4" fontWeight="bold" color="success.main" gutterBottom>
                  {templates.reduce((sum, t) => sum + t.downloads, 0)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Downloads
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper elevation={1} sx={{ p: 3, textAlign: 'center', bgcolor: 'warning.50' }}>
                <Typography variant="h4" fontWeight="bold" color="warning.main" gutterBottom>
                  {templates.filter(t => t.category === 'ai-ml' || t.osType === 'ai-application' || t.osType === 'palet-defect-detection').length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  AI/ML Templates
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper elevation={1} sx={{ p: 3, textAlign: 'center', bgcolor: 'info.50' }}>
                <Typography variant="h4" fontWeight="bold" color="info.main" gutterBottom>
                  {templates.filter(t => t.status === 'active').length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active Templates
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
    </AuthGuard>
  )
}