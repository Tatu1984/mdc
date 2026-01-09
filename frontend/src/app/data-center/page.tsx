'use client'

import Link from 'next/link'
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  LinearProgress,
  Chip,
  Avatar,
  Paper
} from '@mui/material'
import {
  Storage,
  NetworkCheck,
  Computer,
  Science,
  TrendingUp,
  CheckCircle,
  Memory,
  Speed,
  ArrowForward,
  Folder,
  Group,
  Router,
  CloudQueue
} from '@mui/icons-material'
import AuthGuard from '@/components/AuthGuard'

export default function DataCenterPage() {
  const dataCenterSections = [
    {
      title: 'Testbeds',
      description: 'Manage sub-microdata centers and cluster nodes hosting workspace VMs',
      icon: Science,
      href: '/data-center/testbed',
      color: 'success' as const,
      stats: '3 Sub-MicroDCs'
    },
    {
      title: 'Network Switches',
      description: 'Manage and monitor network switching infrastructure',
      icon: Router,
      href: '/data-center/switches',
      color: 'info' as const,
      stats: '3 Active Switches'
    },
    {
      title: 'Workstations',
      description: 'Manage and monitor physical workstation machines',
      icon: Computer,
      href: '/data-center/workstations',
      color: 'primary' as const,
      stats: '24/32 Assigned'
    },
    {
      title: 'VM Templates',
      description: 'Create and manage VM templates for workspace deployments',
      icon: CloudQueue,
      href: '/data-center/vmtemplates',
      color: 'secondary' as const,
      stats: '12 VM Templates'
    }
  ]

  const systemMetrics = [
    {
      label: 'System Status',
      value: 'Operational',
      color: 'success' as const,
      icon: CheckCircle
    },
    {
      label: 'Cluster Nodes',
      value: '8',
      color: 'secondary' as const,
      icon: NetworkCheck
    },
    {
      label: 'Active Workspaces',
      value: '12',
      color: 'primary' as const,
      icon: Folder
    },
    {
      label: 'Workspace VMs',
      value: '47',
      color: 'primary' as const,
      icon: Computer
    },
    {
      label: 'Total Workstations',
      value: '24/32',
      color: 'info' as const,
      icon: Computer
    },
    {
      label: 'CPU Usage',
      value: '68%',
      color: 'warning' as const,
      icon: Speed
    },
    {
      label: 'Memory Usage',
      value: '42 GB',
      color: 'secondary' as const,
      icon: Memory
    },
    {
      label: 'Disk Usage',
      value: '2.4 TB',
      color: 'info' as const,
      icon: Storage
    },
    {
      label: 'Active Users (7d)',
      value: '28',
      color: 'success' as const,
      icon: Group
    }
  ]

  return (
    <AuthGuard>
      <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom fontWeight="bold" color="text.primary">
          Data Center Management
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Manage your infrastructure resources and configurations
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {dataCenterSections.map((section) => {
          const Icon = section.icon
          return (
            <Grid item xs={12} sm={6} md={3} key={section.title}>
              <Card
                elevation={2}
                sx={{
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    elevation: 4,
                    transform: 'translateY(-2px)',
                  },
                }}
                component={Link}
                href={section.href}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: `${section.color}.main`, width: 56, height: 56, mr: 2 }}>
                      <Icon />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" component="h2" fontWeight="bold">
                        {section.title}
                      </Typography>
                      <Chip
                        label={section.stats}
                        color={section.color}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {section.description}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button endIcon={<ArrowForward />} color={section.color}>
                    Manage
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          )
        })}
      </Grid>

      <Card elevation={2}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <TrendingUp sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h5" component="h2" fontWeight="bold">
              System Overview
            </Typography>
          </Box>
          <Grid container spacing={3}>
            {systemMetrics.map((metric) => {
              const Icon = metric.icon
              return (
                <Grid item xs={12} sm={6} md={4} lg={3} key={metric.label}>
                  <Paper elevation={1} sx={{ p: 3, textAlign: 'center', bgcolor: `${metric.color}.50` }}>
                    <Avatar sx={{ bgcolor: `${metric.color}.main`, width: 48, height: 48, mx: 'auto', mb: 2 }}>
                      <Icon />
                    </Avatar>
                    <Typography variant="h4" fontWeight="bold" color={`${metric.color}.main`} gutterBottom>
                      {metric.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {metric.label}
                    </Typography>
                    {(metric.label.includes('Usage') || metric.label.includes('Disk') || metric.label.includes('Workstations')) && (
                      <LinearProgress
                        variant="determinate"
                        value={
                          metric.label === 'Disk Usage' ? 75 :
                          metric.label === 'Total Workstations' ? 75 : // 24/32 = 75%
                          parseInt(metric.value)
                        }
                        color={metric.color}
                        sx={{ mt: 1, height: 6, borderRadius: 3 }}
                      />
                    )}
                  </Paper>
                </Grid>
              )
            })}
          </Grid>
        </CardContent>
      </Card>
      </Box>
    </AuthGuard>
  )
}