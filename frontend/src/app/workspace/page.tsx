'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  IconButton,
  Avatar,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Paper
} from '@mui/material'
import {
  Add as AddIcon,
  Folder,
  Group,
  Schedule,
  Star,
  StarBorder,
  ArrowForward,
  FilterList
} from '@mui/icons-material'
import AuthGuard from '@/components/AuthGuard'

interface Workspace {
  id: string
  name: string
  description: string
  members: number
  lastAccessed: string
  status: 'active' | 'archived'
  favorite: boolean
  created: string
}

export default function WorkspacePage() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([
    {
      id: '1',
      name: 'AI Research Project',
      description: 'Machine learning models and data analysis for customer behavior prediction',
      members: 5,
      lastAccessed: '2024-01-20',
      status: 'active',
      favorite: true,
      created: '2024-01-10'
    },
    {
      id: '2',
      name: 'Web Development',
      description: 'Full-stack web application development using React and Node.js',
      members: 3,
      lastAccessed: '2024-01-19',
      status: 'active',
      favorite: false,
      created: '2024-01-05'
    },
    {
      id: '3',
      name: 'Mobile App Development',
      description: 'Cross-platform mobile application using React Native',
      members: 4,
      lastAccessed: '2024-01-18',
      status: 'active',
      favorite: true,
      created: '2024-01-12'
    },
    {
      id: '4',
      name: 'Legacy System Migration',
      description: 'Migrating old systems to modern cloud infrastructure',
      members: 2,
      lastAccessed: '2024-01-15',
      status: 'archived',
      favorite: false,
      created: '2023-12-01'
    }
  ])

  const [filter, setFilter] = useState<'all' | 'active' | 'archived'>('all')

  const toggleFavorite = (id: string) => {
    setWorkspaces(workspaces.map(workspace =>
      workspace.id === id
        ? { ...workspace, favorite: !workspace.favorite }
        : workspace
    ))
  }

  const filteredWorkspaces = workspaces.filter(workspace => {
    if (filter === 'all') return true
    return workspace.status === filter
  })

  const handleFilterChange = (event: React.SyntheticEvent, newValue: string) => {
    setFilter(newValue as 'all' | 'active' | 'archived')
  }

  const recentActivity = [
    { user: 'John', action: 'deployed to AI Research Project', time: '2 hours ago' },
    { user: 'Sarah', action: 'created a new branch in Web Development', time: '5 hours ago' },
    { user: 'Mike', action: 'added 3 new team members to Mobile App Development', time: '1 day ago' },
  ]

  return (
    <AuthGuard>
      <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h3" component="h1" gutterBottom fontWeight="bold" color="text.primary">
            Workspaces
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Manage your project workspaces and collaborate with your team
          </Typography>
        </Box>
        <Button
          component={Link}
          href="/workspace/create"
          variant="contained"
          startIcon={<AddIcon />}
          size="large"
          sx={{ borderRadius: 2 }}
        >
          Create Workspace
        </Button>
      </Box>

      <Card elevation={2} sx={{ mb: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={filter}
            onChange={handleFilterChange}
            sx={{ px: 2 }}
          >
            <Tab label={`All (${workspaces.length})`} value="all" />
            <Tab label={`Active (${workspaces.filter(w => w.status === 'active').length})`} value="active" />
            <Tab label={`Archived (${workspaces.filter(w => w.status === 'archived').length})`} value="archived" />
          </Tabs>
        </Box>

        <Box sx={{ p: 3 }}>
          <Grid container spacing={3}>
            {filteredWorkspaces.map((workspace) => (
              <Grid item xs={12} md={6} lg={4} key={workspace.id}>
                <Card
                  elevation={1}
                  sx={{
                    height: '100%',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    opacity: workspace.status === 'archived' ? 0.7 : 1,
                    '&:hover': {
                      elevation: 3,
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
                        <Folder />
                      </Avatar>
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleFavorite(workspace.id)
                        }}
                        color={workspace.favorite ? 'warning' : 'default'}
                      >
                        {workspace.favorite ? <Star /> : <StarBorder />}
                      </IconButton>
                    </Box>

                    <Typography variant="h6" component="h3" fontWeight="bold" gutterBottom>
                      {workspace.name}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        mb: 2,
                        minHeight: '2.5em'
                      }}
                    >
                      {workspace.description}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Group fontSize="small" color="action" />
                        <Typography variant="caption" color="text.secondary">
                          {workspace.members} members
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Schedule fontSize="small" color="action" />
                        <Typography variant="caption" color="text.secondary">
                          {workspace.lastAccessed}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Chip
                        label={workspace.status}
                        color={workspace.status === 'active' ? 'success' : 'default'}
                        size="small"
                        variant="outlined"
                      />
                      <Button
                        component={Link}
                        href={`/workspace/${workspace.id}`}
                        endIcon={<ArrowForward />}
                        color="primary"
                      >
                        Open
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {filteredWorkspaces.length === 0 && (
            <Paper sx={{ p: 6, textAlign: 'center', bgcolor: 'grey.50' }}>
              <Folder sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
              <Typography variant="h5" gutterBottom fontWeight="bold">
                No workspaces found
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                {filter === 'all'
                  ? 'Get started by creating your first workspace.'
                  : `No ${filter} workspaces available.`
                }
              </Typography>
              <Button
                component={Link}
                href="/workspace/create"
                variant="contained"
                startIcon={<AddIcon />}
              >
                Create Workspace
              </Button>
            </Paper>
          )}
        </Box>
      </Card>

      <Card elevation={2}>
        <CardContent>
          <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">
            Recent Activity
          </Typography>
          <List>
            {recentActivity.map((activity, index) => (
              <ListItem key={index} divider={index < recentActivity.length - 1}>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'success.main', width: 32, height: 32 }}>
                    {activity.user[0]}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={`${activity.user} ${activity.action}`}
                  secondary={activity.time}
                  primaryTypographyProps={{ variant: 'body2' }}
                  secondaryTypographyProps={{ variant: 'caption' }}
                />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
      </Box>
    </AuthGuard>
  )
}