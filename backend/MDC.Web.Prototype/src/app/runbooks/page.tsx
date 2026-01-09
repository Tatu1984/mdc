'use client'

import { useState } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Divider,
  Alert
} from '@mui/material'
import {
  PlayCircleOutline,
  Description,
  CheckCircle,
  Timer,
  CloudQueue,
  CameraAlt,
  Computer,
  Hub,
  Security,
  Analytics,
  Settings,
  ArrowForward,
  Info,
  Code,
  Monitor,
  RouterOutlined,
  Lan,
  VpnKey,
  Assessment,
  Factory,
  BugReport,
  Warning,
  History,
  PlayArrow,
  Link,
  Person,
  AccessTime,
  Error,
  Launch
} from '@mui/icons-material'

interface RunbookStep {
  id: string
  title: string
  description: string
  action: string
  parameters?: { [key: string]: string }
  estimatedTime: string
  status?: 'pending' | 'running' | 'completed' | 'failed'
}

interface Runbook {
  id: string
  title: string
  description: string
  category: 'deployment' | 'networking' | 'monitoring' | 'security'
  complexity: 'simple' | 'intermediate' | 'advanced'
  estimatedDuration: string
  prerequisites: string[]
  outcomes: string[]
  steps: RunbookStep[]
  tags: string[]
}

interface ExecutedRunbook {
  id: string
  runbookId: string
  title: string
  executedAt: string
  completedAt?: string
  status: 'completed' | 'failed'
  workspaceId?: string
  workspaceName?: string
  executedBy: string
  duration: string
}

interface RunningRunbook {
  id: string
  runbookId: string
  title: string
  startedAt: string
  currentStep: number
  totalSteps: number
  executedBy: string
  estimatedCompletion: string
}

export default function RunbooksPage() {
  const [selectedRunbook, setSelectedRunbook] = useState<Runbook | null>(null)
  const [executeDialogOpen, setExecuteDialogOpen] = useState(false)
  const [activeStep, setActiveStep] = useState(0)

  // Sample executed runbooks data
  const executedRunbooks: ExecutedRunbook[] = [
    {
      id: 'exec-001',
      runbookId: 'rb-001',
      title: 'Palet Defect Detection System',
      executedAt: '2024-01-20T10:30:00Z',
      completedAt: '2024-01-20T11:15:00Z',
      status: 'completed',
      workspaceId: 'ws-ai-research-001',
      workspaceName: 'Palet QC System',
      executedBy: 'John Smith',
      duration: '45 min'
    },
    {
      id: 'exec-002',
      runbookId: 'rb-002',
      title: 'IT/OT Network Segmentation',
      executedAt: '2024-01-19T14:00:00Z',
      completedAt: '2024-01-19T15:05:00Z',
      status: 'completed',
      workspaceId: 'ws-network-001',
      workspaceName: 'Industrial Network Setup',
      executedBy: 'Sarah Johnson',
      duration: '1h 5min'
    },
    {
      id: 'exec-003',
      runbookId: 'rb-003',
      title: 'Edge Computing Platform',
      executedAt: '2024-01-18T09:15:00Z',
      completedAt: '2024-01-18T09:45:00Z',
      status: 'failed',
      executedBy: 'Mike Chen',
      duration: '30 min'
    }
  ]

  // Sample currently running runbooks data
  const runningRunbooks: RunningRunbook[] = [
    {
      id: 'run-001',
      runbookId: 'rb-001',
      title: 'Palet Defect Detection System',
      startedAt: '2024-01-20T16:30:00Z',
      currentStep: 5,
      totalSteps: 9,
      executedBy: 'Alice Wilson',
      estimatedCompletion: '2024-01-20T17:15:00Z'
    },
    {
      id: 'run-002',
      runbookId: 'rb-003',
      title: 'Edge Computing Platform',
      startedAt: '2024-01-20T16:45:00Z',
      currentStep: 2,
      totalSteps: 4,
      executedBy: 'Bob Martinez',
      estimatedCompletion: '2024-01-20T17:10:00Z'
    }
  ]

  const runbooks: Runbook[] = [
    {
      id: 'rb-001',
      title: 'Palet Defect Detection System',
      description: 'Deploy a complete quality control system with AI-powered defect detection for manufacturing pallets',
      category: 'deployment',
      complexity: 'intermediate',
      estimatedDuration: '45 minutes',
      prerequisites: [
        'Available workspace quota',
        'IP Camera hardware available',
        'Intel NUC hardware available',
        'Monitor workstation available'
      ],
      outcomes: [
        'Workspace with AI Research environment',
        'Deployed Palet Defect Detection application',
        'Configured IP camera for visual inspection',
        'NUC workstation for local processing',
        'Monitor for real-time defect visualization'
      ],
      steps: [
        {
          id: 'step-1',
          title: 'Create AI Research Workspace',
          description: 'Initialize a new workspace with Python ML stack and GPU resources',
          action: 'workspace.create',
          parameters: {
            name: 'Palet QC System',
            template: 'AI Research',
            ttl: '720h'
          },
          estimatedTime: '5 min'
        },
        {
          id: 'step-2',
          title: 'Deploy Virtual Networks',
          description: 'Create isolated networks for camera feed and processing',
          action: 'network.create',
          parameters: {
            networks: 'vision-network, processing-network',
            dhcp: 'enabled',
            gateway: '10.0.1.1'
          },
          estimatedTime: '3 min'
        },
        {
          id: 'step-3',
          title: 'Deploy Palet Defect Detection VM',
          description: 'Deploy the pre-configured defect detection application',
          action: 'vm.deploy',
          parameters: {
            template: 'Palet Defect Detection',
            cpu: '8 vCPU',
            memory: '16GB',
            storage: '100GB'
          },
          estimatedTime: '10 min'
        },
        {
          id: 'step-4',
          title: 'Assign IP Camera Workstation',
          description: 'Connect and configure IP camera for visual inspection',
          action: 'workstation.assign',
          parameters: {
            type: 'IP Security Camera',
            network: 'vision-network',
            position: 'Production Line A'
          },
          estimatedTime: '5 min'
        },
        {
          id: 'step-5',
          title: 'Assign Intel NUC Workstation',
          description: 'Setup NUC for edge processing and local inference',
          action: 'workstation.assign',
          parameters: {
            type: 'Intel NUC',
            network: 'processing-network',
            role: 'Edge Processor'
          },
          estimatedTime: '5 min'
        },
        {
          id: 'step-6',
          title: 'Configure Monitor Display',
          description: 'Setup monitoring dashboard for defect visualization',
          action: 'workstation.configure',
          parameters: {
            type: 'Monitor',
            display: 'Defect Dashboard',
            refresh: '1s'
          },
          estimatedTime: '3 min'
        },
        {
          id: 'step-7',
          title: 'Initialize AI Model',
          description: 'Load and calibrate defect detection model',
          action: 'app.initialize',
          parameters: {
            model: 'YOLOv8-Defect',
            confidence: '0.85',
            categories: 'crack, chip, warp, stain'
          },
          estimatedTime: '8 min'
        },
        {
          id: 'step-8',
          title: 'Start Real-time Processing',
          description: 'Begin live defect detection and monitoring',
          action: 'app.start',
          parameters: {
            stream: 'camera-feed',
            output: 'dashboard',
            alerts: 'enabled'
          },
          estimatedTime: '2 min'
        },
        {
          id: 'step-9',
          title: 'Verify System Operation',
          description: 'Run test samples and verify detection accuracy',
          action: 'test.run',
          parameters: {
            samples: 'test-pallets',
            expected: '95% accuracy'
          },
          estimatedTime: '5 min'
        }
      ],
      tags: ['AI', 'Computer Vision', 'Quality Control', 'Manufacturing']
    },
    {
      id: 'rb-002',
      title: 'IT/OT Network Segmentation',
      description: 'Create secure segmented networks with IT/OT separation, bastion hosts, and proper security zones',
      category: 'networking',
      complexity: 'advanced',
      estimatedDuration: '60 minutes',
      prerequisites: [
        'Network architecture approval',
        'Security policy defined',
        'Available IP ranges',
        'Bastion host template'
      ],
      outcomes: [
        'Segmented IT network for business systems',
        'Isolated OT network for operational technology',
        'Bastion host in IT network for secure access',
        'Camera and AI systems in OT network',
        'BI analytics in IT network with controlled data flow'
      ],
      steps: [
        {
          id: 'step-1',
          title: 'Create IT Network Segment',
          description: 'Setup enterprise IT network for business applications',
          action: 'network.create',
          parameters: {
            name: 'IT-Network',
            cidr: '10.100.0.0/16',
            zone: 'enterprise',
            firewall: 'enabled'
          },
          estimatedTime: '5 min'
        },
        {
          id: 'step-2',
          title: 'Create OT Network Segment',
          description: 'Setup isolated operational technology network',
          action: 'network.create',
          parameters: {
            name: 'OT-Network',
            cidr: '192.168.0.0/16',
            zone: 'industrial',
            isolation: 'strict'
          },
          estimatedTime: '5 min'
        },
        {
          id: 'step-3',
          title: 'Deploy IT Bastion Host',
          description: 'Create secure jump server in IT network',
          action: 'vm.deploy',
          parameters: {
            template: 'Ubuntu 22.04 Bastion',
            network: 'IT-Network',
            security: 'hardened',
            mfa: 'enabled'
          },
          estimatedTime: '8 min'
        },
        {
          id: 'step-4',
          title: 'Configure Network Firewall Rules',
          description: 'Setup security policies between IT and OT zones',
          action: 'firewall.configure',
          parameters: {
            rule1: 'IT->OT: Deny All',
            rule2: 'OT->IT: Allow HTTPS 443',
            rule3: 'Bastion->OT: Allow SSH 22'
          },
          estimatedTime: '10 min'
        },
        {
          id: 'step-5',
          title: 'Deploy Camera System in OT',
          description: 'Install security cameras in OT network',
          action: 'workstation.deploy',
          parameters: {
            type: 'IP Camera Array',
            network: 'OT-Network',
            vlan: '200',
            count: '4'
          },
          estimatedTime: '8 min'
        },
        {
          id: 'step-6',
          title: 'Deploy AI Processing in OT',
          description: 'Setup AI inference system in OT zone',
          action: 'vm.deploy',
          parameters: {
            template: 'AI Application Server',
            network: 'OT-Network',
            gpu: 'enabled',
            isolation: 'container'
          },
          estimatedTime: '10 min'
        },
        {
          id: 'step-7',
          title: 'Deploy BI Analytics in IT',
          description: 'Setup business intelligence platform in IT network',
          action: 'vm.deploy',
          parameters: {
            template: 'BI Analytics Platform',
            network: 'IT-Network',
            database: 'PostgreSQL',
            dashboard: 'Grafana'
          },
          estimatedTime: '8 min'
        },
        {
          id: 'step-8',
          title: 'Configure Data Diode',
          description: 'Setup one-way data flow from OT to IT',
          action: 'network.configure',
          parameters: {
            type: 'data-diode',
            direction: 'OT->IT',
            protocol: 'MQTT',
            port: '1883'
          },
          estimatedTime: '5 min'
        },
        {
          id: 'step-9',
          title: 'Validate Security Posture',
          description: 'Run security scan and compliance check',
          action: 'security.scan',
          parameters: {
            profile: 'IEC-62443',
            zones: 'IT, OT',
            report: 'enabled'
          },
          estimatedTime: '10 min'
        }
      ],
      tags: ['Security', 'Networking', 'IT/OT', 'Industrial', 'Compliance']
    },
    {
      id: 'rb-003',
      title: 'Edge Computing Platform',
      description: 'Deploy distributed edge computing infrastructure for real-time processing',
      category: 'deployment',
      complexity: 'intermediate',
      estimatedDuration: '30 minutes',
      prerequisites: [
        'Edge hardware available',
        'Network connectivity',
        'Container registry access'
      ],
      outcomes: [
        'Edge computing nodes deployed',
        'Container orchestration configured',
        'Real-time processing pipeline',
        'Monitoring and alerting setup'
      ],
      steps: [
        {
          id: 'step-1',
          title: 'Initialize Edge Cluster',
          description: 'Setup K3s lightweight Kubernetes for edge',
          action: 'cluster.create',
          parameters: {
            type: 'k3s',
            nodes: '3',
            profile: 'edge'
          },
          estimatedTime: '10 min'
        },
        {
          id: 'step-2',
          title: 'Deploy Edge Applications',
          description: 'Install containerized edge workloads',
          action: 'app.deploy',
          parameters: {
            manifest: 'edge-stack.yaml',
            namespace: 'edge-apps'
          },
          estimatedTime: '8 min'
        },
        {
          id: 'step-3',
          title: 'Configure IoT Gateway',
          description: 'Setup MQTT broker and protocol translation',
          action: 'gateway.configure',
          parameters: {
            broker: 'mosquitto',
            protocols: 'MQTT, OPC-UA, Modbus'
          },
          estimatedTime: '5 min'
        },
        {
          id: 'step-4',
          title: 'Setup Monitoring Stack',
          description: 'Deploy Prometheus and Grafana for edge monitoring',
          action: 'monitoring.deploy',
          parameters: {
            retention: '7d',
            alerts: 'enabled'
          },
          estimatedTime: '7 min'
        }
      ],
      tags: ['Edge', 'IoT', 'Kubernetes', 'Real-time']
    }
  ]

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'deployment': return 'primary'
      case 'networking': return 'secondary'
      case 'monitoring': return 'success'
      case 'security': return 'warning'
      default: return 'default'
    }
  }

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'simple': return 'success'
      case 'intermediate': return 'warning'
      case 'advanced': return 'error'
      default: return 'default'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'deployment': return <CloudQueue />
      case 'networking': return <Hub />
      case 'monitoring': return <Analytics />
      case 'security': return <Security />
      default: return <Settings />
    }
  }

  const handleExecuteRunbook = (runbook: Runbook) => {
    setSelectedRunbook(runbook)
    setExecuteDialogOpen(true)
    setActiveStep(0)
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Description sx={{ color: 'primary.main', fontSize: '3rem' }} />
          <Box>
            <Typography variant="h3" component="h1" fontWeight="bold">
              Runbooks
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Automated deployment templates and operational procedures
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Currently Executing Runbooks */}
      {runningRunbooks.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <PlayArrow sx={{ color: 'warning.main', fontSize: '2rem' }} />
            <Typography variant="h5" fontWeight="bold">
              Currently Executing
            </Typography>
            <Chip
              label={`${runningRunbooks.length} running`}
              color="warning"
              size="small"
            />
          </Box>
          <Grid container spacing={2}>
            {runningRunbooks.map((running) => (
              <Grid item xs={12} md={6} key={running.id}>
                <Card elevation={2} sx={{ border: 2, borderColor: 'warning.main' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="h6" fontWeight="bold">
                        {running.title}
                      </Typography>
                      <Chip
                        icon={<PlayArrow />}
                        label="Running"
                        color="warning"
                        size="small"
                      />
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Progress: Step {running.currentStep} of {running.totalSteps}
                      </Typography>
                      <Box sx={{ width: '100%', bgcolor: 'grey.200', borderRadius: 1, p: 0.5 }}>
                        <Box
                          sx={{
                            width: `${(running.currentStep / running.totalSteps) * 100}%`,
                            bgcolor: 'warning.main',
                            height: 8,
                            borderRadius: 1
                          }}
                        />
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Person fontSize="small" />
                        <Typography variant="caption">
                          {running.executedBy}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AccessTime fontSize="small" />
                        <Typography variant="caption">
                          ETA: {new Date(running.estimatedCompletion).toLocaleTimeString()}
                        </Typography>
                      </Box>
                    </Box>

                    <Typography variant="caption" color="text.secondary">
                      Started: {new Date(running.startedAt).toLocaleString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Previously Executed Runbooks */}
      {executedRunbooks.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <History sx={{ color: 'info.main', fontSize: '2rem' }} />
            <Typography variant="h5" fontWeight="bold">
              Execution History
            </Typography>
            <Chip
              label={`${executedRunbooks.filter(r => r.status === 'completed').length} completed`}
              color="success"
              size="small"
            />
            {executedRunbooks.filter(r => r.status === 'failed').length > 0 && (
              <Chip
                label={`${executedRunbooks.filter(r => r.status === 'failed').length} failed`}
                color="error"
                size="small"
              />
            )}
          </Box>
          <Grid container spacing={2}>
            {executedRunbooks.map((executed) => (
              <Grid item xs={12} md={6} lg={4} key={executed.id}>
                <Card elevation={1} sx={{
                  border: 1,
                  borderColor: executed.status === 'completed' ? 'success.main' : 'error.main',
                  '&:hover': { elevation: 3 }
                }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="h6" fontWeight="bold" sx={{ fontSize: '1rem' }}>
                        {executed.title}
                      </Typography>
                      <Chip
                        icon={executed.status === 'completed' ? <CheckCircle /> : <Error />}
                        label={executed.status}
                        color={executed.status === 'completed' ? 'success' : 'error'}
                        size="small"
                      />
                    </Box>

                    {executed.workspaceId && executed.workspaceName && (
                      <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        mb: 1,
                        p: 1,
                        bgcolor: 'primary.50',
                        borderRadius: 1,
                        border: 1,
                        borderColor: 'primary.100'
                      }}>
                        <Link fontSize="small" color="primary" />
                        <Typography
                          variant="caption"
                          component="a"
                          href={`/workspace/${executed.workspaceId}`}
                          sx={{
                            color: 'primary.main',
                            textDecoration: 'none',
                            fontWeight: 'bold',
                            '&:hover': { textDecoration: 'underline' }
                          }}
                        >
                          {executed.workspaceName}
                        </Typography>
                        <Launch fontSize="small" color="primary" />
                      </Box>
                    )}

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Person fontSize="small" />
                        <Typography variant="caption">
                          {executed.executedBy}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Timer fontSize="small" />
                        <Typography variant="caption">
                          {executed.duration}
                        </Typography>
                      </Box>
                    </Box>

                    <Typography variant="caption" color="text.secondary" display="block">
                      Executed: {new Date(executed.executedAt).toLocaleString()}
                    </Typography>
                    {executed.completedAt && (
                      <Typography variant="caption" color="text.secondary" display="block">
                        Completed: {new Date(executed.completedAt).toLocaleString()}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Available Runbooks */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Description sx={{ color: 'primary.main', fontSize: '2rem' }} />
          <Typography variant="h5" fontWeight="bold">
            Available Templates
          </Typography>
          <Chip
            label={`${runbooks.length} templates`}
            color="primary"
            size="small"
          />
        </Box>
        {/* Runbooks Grid */}
        <Grid container spacing={3}>
        {runbooks.map((runbook) => (
          <Grid item xs={12} md={6} lg={4} key={runbook.id}>
            <Card elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {getCategoryIcon(runbook.category)}
                    <Typography variant="h6" fontWeight="bold">
                      {runbook.title}
                    </Typography>
                  </Box>
                  <IconButton size="small" color="primary">
                    <Info />
                  </IconButton>
                </Box>

                {/* Description */}
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {runbook.description}
                </Typography>

                {/* Metadata Chips */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  <Chip
                    label={runbook.category}
                    size="small"
                    color={getCategoryColor(runbook.category) as any}
                    variant="outlined"
                  />
                  <Chip
                    label={runbook.complexity}
                    size="small"
                    color={getComplexityColor(runbook.complexity) as any}
                  />
                  <Chip
                    icon={<Timer />}
                    label={runbook.estimatedDuration}
                    size="small"
                    variant="outlined"
                  />
                </Box>

                {/* Key Outcomes */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                    Key Outcomes:
                  </Typography>
                  <List dense>
                    {runbook.outcomes.slice(0, 3).map((outcome, idx) => (
                      <ListItem key={idx} sx={{ py: 0, px: 0 }}>
                        <ListItemIcon sx={{ minWidth: 28 }}>
                          <CheckCircle color="success" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText
                          primary={outcome}
                          primaryTypographyProps={{ variant: 'caption' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>

                {/* Tags */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                  {runbook.tags.map((tag, idx) => (
                    <Chip
                      key={idx}
                      label={tag}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: '0.7rem' }}
                    />
                  ))}
                </Box>

                {/* Steps Count */}
                <Typography variant="caption" color="text.secondary">
                  {runbook.steps.length} automated steps
                </Typography>
              </CardContent>

              {/* Actions */}
              <Divider />
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between' }}>
                <Button
                  variant="text"
                  size="small"
                  onClick={() => setSelectedRunbook(runbook)}
                >
                  View Details
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<PlayCircleOutline />}
                  onClick={() => handleExecuteRunbook(runbook)}
                >
                  Execute
                </Button>
              </Box>
            </Card>
          </Grid>
        ))}
        </Grid>
      </Box>

      {/* Execute Runbook Dialog */}
      <Dialog
        open={executeDialogOpen}
        onClose={() => setExecuteDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h5" fontWeight="bold">
            Execute Runbook: {selectedRunbook?.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Follow the automated steps to complete the deployment
          </Typography>
        </DialogTitle>
        <DialogContent>
          {selectedRunbook && (
            <Box sx={{ mt: 2 }}>
              {/* Prerequisites Alert */}
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  Prerequisites:
                </Typography>
                {selectedRunbook.prerequisites.map((prereq, idx) => (
                  <Typography key={idx} variant="caption" display="block">
                    • {prereq}
                  </Typography>
                ))}
              </Alert>

              {/* Execution Steps */}
              <Stepper activeStep={activeStep} orientation="vertical">
                {selectedRunbook.steps.map((step, index) => (
                  <Step key={step.id}>
                    <StepLabel
                      StepIconComponent={() => (
                        <Box
                          sx={{
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            bgcolor: index < activeStep ? 'success.main' :
                                   index === activeStep ? 'primary.main' : 'grey.300',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.75rem'
                          }}
                        >
                          {index < activeStep ? <CheckCircle fontSize="small" /> : index + 1}
                        </Box>
                      )}
                    >
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {step.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Estimated time: {step.estimatedTime}
                        </Typography>
                      </Box>
                    </StepLabel>
                    <StepContent>
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        {step.description}
                      </Typography>
                      {step.parameters && (
                        <Paper elevation={1} sx={{ p: 2, bgcolor: 'grey.50', mb: 2 }}>
                          <Typography variant="caption" fontWeight="bold" gutterBottom>
                            Parameters:
                          </Typography>
                          {Object.entries(step.parameters).map(([key, value]) => (
                            <Typography key={key} variant="caption" display="block" sx={{ fontFamily: 'monospace' }}>
                              {key}: {value}
                            </Typography>
                          ))}
                        </Paper>
                      )}
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => setActiveStep(activeStep + 1)}
                        >
                          Execute & Continue
                        </Button>
                        {index > 0 && (
                          <Button
                            size="small"
                            onClick={() => setActiveStep(activeStep - 1)}
                          >
                            Back
                          </Button>
                        )}
                      </Box>
                    </StepContent>
                  </Step>
                ))}
              </Stepper>

              {activeStep === selectedRunbook.steps.length && (
                <Paper elevation={1} sx={{ p: 3, mt: 3, bgcolor: 'success.50', border: 1, borderColor: 'success.main' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <CheckCircle color="success" sx={{ fontSize: '2rem' }} />
                    <Box>
                      <Typography variant="h6" fontWeight="bold" color="success.main">
                        Runbook Completed Successfully!
                      </Typography>
                      <Typography variant="body2">
                        All steps have been executed. Your deployment is ready.
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setExecuteDialogOpen(false)} color="inherit">
            Close
          </Button>
          {activeStep === selectedRunbook?.steps.length && (
            <Button variant="contained" color="success" onClick={() => {
              setExecuteDialogOpen(false)
              setActiveStep(0)
            }}>
              View Deployment
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* View Details Dialog */}
      {selectedRunbook && !executeDialogOpen && (
        <Dialog
          open={!!selectedRunbook && !executeDialogOpen}
          onClose={() => setSelectedRunbook(null)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Typography variant="h5" fontWeight="bold">
              {selectedRunbook.title}
            </Typography>
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {selectedRunbook.description}
            </Typography>

            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
              Steps Overview
            </Typography>
            <List>
              {selectedRunbook.steps.map((step, idx) => (
                <ListItem key={idx}>
                  <ListItemIcon>
                    <ArrowForward color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={step.title}
                    secondary={step.description}
                  />
                </ListItem>
              ))}
            </List>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setSelectedRunbook(null)} color="inherit">
              Close
            </Button>
            <Button
              variant="contained"
              startIcon={<PlayCircleOutline />}
              onClick={() => handleExecuteRunbook(selectedRunbook)}
            >
              Execute
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  )
}