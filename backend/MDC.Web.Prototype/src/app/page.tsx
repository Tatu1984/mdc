'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Paper,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Chip,
  LinearProgress,
  IconButton,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Badge,
  Tooltip
} from '@mui/material'
import {
  Dashboard as DashboardIcon,
  Folder,
  Computer,
  DataUsage,
  Science,
  TrendingUp,
  CheckCircle,
  Error,
  Info,
  ArrowForward,
  Description,
  PlayArrow,
  Group,
  NetworkCheck as Network,
  Security,
  Memory,
  Storage,
  Speed,
  Warning,
  Schedule,
  VpnKey,
  Person,
  Launch,
  Settings,
  Router,
  Hub,
  Analytics,
  Timer,
  CloudQueue,
  History
} from '@mui/icons-material'

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const quickStats = [
    { label: 'Active Workspaces', value: '8', change: '+2', color: 'primary' as const, icon: Folder, href: '/workspace' },
    { label: 'Running VMs', value: '23', change: '+5', color: 'success' as const, icon: Computer, href: '/data-center/vmtemplates' },
    { label: 'Executing Runbooks', value: '3', change: '+1', color: 'warning' as const, icon: Description, href: '/runbooks' },
    { label: 'Workstations', value: '45', change: '+8', color: 'secondary' as const, icon: Router, href: '/data-center/workstations' },
  ]

  const infrastructureMetrics = [
    { label: 'CPU Usage', value: 68, color: 'primary', icon: Speed },
    { label: 'Memory Usage', value: 72, color: 'secondary', icon: Memory },
    { label: 'Storage Usage', value: 45, color: 'success', icon: Storage },
    { label: 'Network Load', value: 38, color: 'info', icon: Network },
  ]

  const activeWorkspaces = [
    {
      id: 'ws-ai-research-001',
      name: 'Palet QC System',
      type: 'AI Research',
      ttlHours: 672,
      team: 4,
      vms: 3,
      status: 'running',
      tags: ['production', 'ai', 'manufacturing']
    },
    {
      id: 'ws-network-001',
      name: 'Industrial Network Setup',
      type: 'Network Security',
      ttlHours: 168,
      team: 2,
      vms: 5,
      status: 'running',
      tags: ['security', 'network', 'it-ot']
    },
    {
      id: 'ws-dev-003',
      name: 'Edge Computing Test',
      type: 'Development',
      ttlHours: 48,
      team: 3,
      vms: 2,
      status: 'warning',
      tags: ['development', 'edge', 'iot']
    }
  ]

  const runningRunbooks = [
    {
      id: 'run-001',
      title: 'Palet Defect Detection System',
      progress: 67,
      currentStep: 'Deploy AI Processing VM',
      executor: 'Alice Wilson',
      eta: '15 min'
    },
    {
      id: 'run-002',
      title: 'IT/OT Network Segmentation',
      progress: 89,
      currentStep: 'Configure Security Policies',
      executor: 'Bob Martinez',
      eta: '5 min'
    }
  ]

  const recentActivity = [
    {
      action: 'Runbook "Palet Defect Detection" completed successfully',
      time: mounted ? new Date(Date.now() - 2 * 60 * 1000).toLocaleTimeString() : '2 min ago',
      type: 'success',
      icon: CheckCircle,
      link: '/runbooks'
    },
    {
      action: 'Workspace "AI Research" TTL extended to 30 days',
      time: mounted ? new Date(Date.now() - 15 * 60 * 1000).toLocaleTimeString() : '15 min ago',
      type: 'info',
      icon: Schedule,
      link: '/workspace/ws-ai-research-001'
    },
    {
      action: 'New workstation assigned to Industrial Network',
      time: mounted ? new Date(Date.now() - 60 * 60 * 1000).toLocaleTimeString() : '1 hour ago',
      type: 'info',
      icon: Router,
      link: '/data-center/workstations'
    },
    {
      action: 'Infrastructure update: Proxmox VE upgraded to 8.1.4',
      time: mounted ? new Date(Date.now() - 2 * 60 * 60 * 1000).toLocaleTimeString() : '2 hours ago',
      type: 'success',
      icon: CloudQueue,
      link: '/data-center/testbed'
    },
    {
      action: 'API key "Production API" expires in 7 days',
      time: mounted ? new Date(Date.now() - 3 * 60 * 60 * 1000).toLocaleTimeString() : '3 hours ago',
      type: 'warning',
      icon: Warning,
      link: '/user'
    }
  ]

  const quickActions = [
    {
      title: 'Execute Runbook',
      description: 'Deploy with automated templates',
      href: '/runbooks',
      icon: Description,
      color: 'primary' as const
    },
    {
      title: 'Create Workspace',
      description: 'Start a new project environment',
      href: '/workspace',
      icon: Folder,
      color: 'success' as const
    },
    {
      title: 'Deploy VM Template',
      description: 'Launch preconfigured systems',
      href: '/data-center/vmtemplates',
      icon: Computer,
      color: 'secondary' as const
    },
    {
      title: 'Monitor Infrastructure',
      description: 'View system health and metrics',
      href: '/data-center/testbed',
      icon: Analytics,
      color: 'warning' as const
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'success'
      case 'warning': return 'warning'
      case 'error': return 'error'
      default: return 'default'
    }
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom fontWeight="bold" color="text.primary">
          MicroDataCenter Dashboard
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Comprehensive overview of your infrastructure, workspaces, and automated deployments
        </Typography>
      </Box>

      {/* Quick Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {quickStats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                elevation={2}
                sx={{
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': { elevation: 4, transform: 'translateY(-2px)' }
                }}
                component={Link}
                href={stat.href}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography color="text.secondary" gutterBottom variant="body2">
                        {stat.label}
                      </Typography>
                      <Typography variant="h4" component="div" fontWeight="bold">
                        {stat.value}
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: `${stat.color}.main`, width: 56, height: 56 }}>
                      <Icon />
                    </Avatar>
                  </Box>
                  <Box sx={{ mt: 2 }}>
                    <Chip
                      label={stat.change}
                      color={stat.color}
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )
        })}
      </Grid>

      {/* Main Content Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Currently Executing Runbooks */}
        <Grid item xs={12} lg={6}>
          <Card elevation={2} sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <PlayArrow sx={{ mr: 1, color: 'warning.main' }} />
                <Typography variant="h5" component="h2" fontWeight="bold">
                  Active Runbooks
                </Typography>
                <Badge badgeContent={runningRunbooks.length} color="warning" sx={{ ml: 2 }}>
                  <Description />
                </Badge>
              </Box>
              {runningRunbooks.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {runningRunbooks.map((runbook) => (
                    <Paper key={runbook.id} elevation={1} sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {runbook.title}
                        </Typography>
                        <Chip label={`${runbook.progress}%`} color="warning" size="small" />
                      </Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {runbook.currentStep}
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={runbook.progress}
                        color="warning"
                        sx={{ mb: 1, height: 6, borderRadius: 3 }}
                      />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Person fontSize="small" />
                          <Typography variant="caption">{runbook.executor}</Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          ETA: {runbook.eta}
                        </Typography>
                      </Box>
                    </Paper>
                  ))}
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    No runbooks currently executing
                  </Typography>
                </Box>
              )}
            </CardContent>
            <CardActions>
              <Button component={Link} href="/runbooks" endIcon={<ArrowForward />}>
                View All Runbooks
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* Infrastructure Metrics */}
        <Grid item xs={12} lg={6}>
          <Card elevation={2} sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Analytics sx={{ mr: 1, color: 'info.main' }} />
                <Typography variant="h5" component="h2" fontWeight="bold">
                  Infrastructure Health
                </Typography>
              </Box>
              <Grid container spacing={3}>
                {infrastructureMetrics.map((metric, index) => {
                  const Icon = metric.icon
                  return (
                    <Grid item xs={6} key={index}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Avatar sx={{ bgcolor: `${metric.color}.main`, width: 48, height: 48, mx: 'auto', mb: 1 }}>
                          <Icon />
                        </Avatar>
                        <Typography variant="h5" fontWeight="bold" color={`${metric.color}.main`}>
                          {metric.value}%
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {metric.label}
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={metric.value}
                          color={metric.color as any}
                          sx={{ height: 6, borderRadius: 3 }}
                        />
                      </Box>
                    </Grid>
                  )
                })}
              </Grid>
            </CardContent>
            <CardActions>
              <Button component={Link} href="/data-center/testbed" endIcon={<ArrowForward />}>
                View Detailed Metrics
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>

      {/* Active Workspaces Table */}
      <Card elevation={2} sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Folder sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h5" component="h2" fontWeight="bold">
              Active Workspaces
            </Typography>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Workspace</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>TTL</TableCell>
                  <TableCell>Team</TableCell>
                  <TableCell>VMs</TableCell>
                  <TableCell>Tags</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {activeWorkspaces.map((workspace) => (
                  <TableRow key={workspace.id} hover>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {workspace.name}
                      </Typography>
                    </TableCell>
                    <TableCell>{workspace.type}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Schedule fontSize="small" />
                        <Typography variant="body2">
                          {Math.floor(workspace.ttlHours / 24)}d {workspace.ttlHours % 24}h
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Group fontSize="small" />
                        <Typography variant="body2">{workspace.team}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Computer fontSize="small" />
                        <Typography variant="body2">{workspace.vms}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {workspace.tags.slice(0, 2).map((tag, idx) => (
                          <Chip key={idx} label={tag} size="small" variant="outlined" />
                        ))}
                        {workspace.tags.length > 2 && (
                          <Chip label={`+${workspace.tags.length - 2}`} size="small" variant="outlined" />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={workspace.status}
                        color={getStatusColor(workspace.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Tooltip title="View Workspace">
                        <IconButton
                          size="small"
                          component={Link}
                          href={`/workspace/${workspace.id}`}
                        >
                          <Launch fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
        <CardActions>
          <Button component={Link} href="/workspace" endIcon={<ArrowForward />}>
            View All Workspaces
          </Button>
        </CardActions>
      </Card>

      {/* Bottom Row */}
      <Grid container spacing={3}>
        {/* Quick Actions */}
        <Grid item xs={12} md={6}>
          <Card elevation={2} sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">
                Quick Actions
              </Typography>
              <Grid container spacing={2}>
                {quickActions.map((action, index) => {
                  const Icon = action.icon
                  return (
                    <Grid item xs={12} sm={6} key={index}>
                      <Paper
                        elevation={2}
                        sx={{
                          p: 3,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease-in-out',
                          border: 1,
                          borderColor: 'divider',
                          borderRadius: 2,
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          '&:hover': {
                            elevation: 4,
                            transform: 'translateY(-4px)',
                            borderColor: `${action.color}.main`,
                            boxShadow: theme => `0 8px 16px ${theme.palette[action.color].main}25`,
                          },
                        }}
                        component={Link}
                        href={action.href}
                        style={{ textDecoration: 'none', color: 'inherit' }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                          <Avatar sx={{
                            bgcolor: `${action.color}.main`,
                            width: 48,
                            height: 48,
                            mr: 2,
                            boxShadow: theme => `0 4px 8px ${theme.palette[action.color].main}30`
                          }}>
                            <Icon />
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="h6" fontWeight="bold" gutterBottom>
                              {action.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
                              {action.description}
                            </Typography>
                          </Box>
                        </Box>
                      </Paper>
                    </Grid>
                  )
                })}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Enhanced Activity Feed */}
        <Grid item xs={12} md={6}>
          <Card elevation={2} sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <History sx={{ mr: 1, color: 'info.main' }} />
                <Typography variant="h5" component="h2" fontWeight="bold">
                  Recent Activity
                </Typography>
              </Box>
              <List dense>
                {recentActivity.map((activity, index) => {
                  const Icon = activity.icon
                  const getColor = (type: string) => {
                    switch (type) {
                      case 'success': return 'success.main'
                      case 'error': return 'error.main'
                      case 'warning': return 'warning.main'
                      default: return 'info.main'
                    }
                  }
                  return (
                    <ListItem
                      key={index}
                      divider={index < recentActivity.length - 1}
                      sx={{
                        cursor: 'pointer',
                        '&:hover': { bgcolor: 'action.hover' }
                      }}
                      component={Link}
                      href={activity.link}
                      style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: getColor(activity.type), width: 32, height: 32 }}>
                          <Icon fontSize="small" />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={activity.action}
                        secondary={activity.time}
                        primaryTypographyProps={{ variant: 'body2', fontWeight: 'medium' }}
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                      <Launch fontSize="small" color="action" />
                    </ListItem>
                  )
                })}
              </List>
            </CardContent>
            <CardActions>
              <Button endIcon={<ArrowForward />} color="primary">
                View Full Activity Log
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}