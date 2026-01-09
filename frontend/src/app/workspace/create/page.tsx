'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import AuthGuard from '@/components/AuthGuard'
import {
  Box,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  Grid,
  Chip,
  Avatar,
  IconButton,
  Paper,
  Divider,
  FormHelperText,
  SelectChangeEvent
} from '@mui/material'
import {
  ArrowBack,
  Folder,
  Group,
  Settings,
  Computer,
  Security,
  AccessTime,
  Add,
  Delete
} from '@mui/icons-material'

export default function CreateWorkspacePage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    gatewayTemplate: '',
    bastionTemplate: '',
    ttl: 24, // hours
    members: [
      { email: 'current.user@company.com', role: 'Owner' as 'Owner' | 'Contributor' }
    ] as { email: string; role: 'Owner' | 'Contributor' }[]
  })

  const [newMember, setNewMember] = useState({ email: '', role: 'Contributor' as 'Owner' | 'Contributor' })

  const gatewayTemplates = [
    { id: 'ubuntu-22.04-gateway', name: 'Ubuntu 22.04 Gateway', description: 'Standard Ubuntu server with gateway configuration' },
    { id: 'centos-8-gateway', name: 'CentOS 8 Gateway', description: 'Enterprise-grade CentOS gateway server' },
    { id: 'alpine-gateway', name: 'Alpine Linux Gateway', description: 'Lightweight Alpine Linux gateway' },
    { id: 'windows-server-gateway', name: 'Windows Server Gateway', description: 'Windows Server 2019 gateway configuration' }
  ]

  const bastionTemplates = [
    { id: 'ubuntu-22.04-bastion', name: 'Ubuntu 22.04 Bastion', description: 'Secure Ubuntu bastion host' },
    { id: 'centos-8-bastion', name: 'CentOS 8 Bastion', description: 'Hardened CentOS bastion server' },
    { id: 'alpine-bastion', name: 'Alpine Linux Bastion', description: 'Minimal Alpine bastion host' },
    { id: 'windows-server-bastion', name: 'Windows Server Bastion', description: 'Windows Server 2019 bastion host' }
  ]

  const ttlOptions = [
    { value: 1, label: '1 Hour' },
    { value: 4, label: '4 Hours' },
    { value: 8, label: '8 Hours' },
    { value: 12, label: '12 Hours' },
    { value: 24, label: '1 Day' },
    { value: 48, label: '2 Days' },
    { value: 72, label: '3 Days' },
    { value: 168, label: '1 Week' },
    { value: 720, label: '1 Month' }
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically send the data to your API
    console.log('Creating workspace with data:', formData)
    router.push('/workspace')
  }

  const addMember = () => {
    if (newMember.email && !formData.members.some(member => member.email === newMember.email)) {
      setFormData({
        ...formData,
        members: [...formData.members, newMember]
      })
      setNewMember({ email: '', role: 'Contributor' })
    }
  }

  const removeMember = (email: string) => {
    // Don't allow removing the current user
    if (email === 'current.user@company.com') return

    setFormData({
      ...formData,
      members: formData.members.filter(member => member.email !== email)
    })
  }

  const updateMemberRole = (email: string, role: 'Owner' | 'Contributor') => {
    setFormData({
      ...formData,
      members: formData.members.map(member =>
        member.email === email ? { ...member, role } : member
      )
    })
  }

  return (
    <AuthGuard>
    <Box>
      <Box sx={{ mb: 4 }}>
        <Button
          onClick={() => router.back()}
          startIcon={<ArrowBack />}
          sx={{ mb: 2 }}
        >
          Back to Workspaces
        </Button>
        <Typography variant="h3" component="h1" gutterBottom fontWeight="bold" color="text.primary">
          Create New Workspace
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Set up a new workspace with default templates and configure team access
        </Typography>
      </Box>

      <Box component="form" onSubmit={handleSubmit} sx={{ space: 3 }}>
        {/* Basic Information */}
        <Card elevation={2} sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Folder sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h5" component="h2" fontWeight="bold">
                Basic Information
              </Typography>
            </Box>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  label="Workspace Name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  helperText="Enter a unique name for your workspace"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  helperText="Describe your workspace and its purpose"
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* VM Template Selection */}
        <Card elevation={2} sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Computer sx={{ mr: 1, color: 'success.main' }} />
              <Typography variant="h5" component="h2" fontWeight="bold">
                VM Template Configuration
              </Typography>
            </Box>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Gateway VM Template</InputLabel>
                  <Select
                    value={formData.gatewayTemplate}
                    label="Gateway VM Template"
                    onChange={(e: SelectChangeEvent) => setFormData({...formData, gatewayTemplate: e.target.value})}
                  >
                    {gatewayTemplates.map((template) => (
                      <MenuItem key={template.id} value={template.id}>
                        <Box>
                          <Typography variant="body1" fontWeight="medium">
                            {template.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {template.description}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>Select the gateway VM template for network access</FormHelperText>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Bastion VM Template</InputLabel>
                  <Select
                    value={formData.bastionTemplate}
                    label="Bastion VM Template"
                    onChange={(e: SelectChangeEvent) => setFormData({...formData, bastionTemplate: e.target.value})}
                  >
                    {bastionTemplates.map((template) => (
                      <MenuItem key={template.id} value={template.id}>
                        <Box>
                          <Typography variant="body1" fontWeight="medium">
                            {template.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {template.description}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>Select the bastion host template for secure access</FormHelperText>
                </FormControl>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* TTL Configuration */}
        <Card elevation={2} sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <AccessTime sx={{ mr: 1, color: 'warning.main' }} />
              <Typography variant="h5" component="h2" fontWeight="bold">
                Time To Live (TTL)
              </Typography>
            </Box>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Workspace TTL</InputLabel>
                  <Select
                    value={formData.ttl}
                    label="Workspace TTL"
                    onChange={(e: SelectChangeEvent<number>) => setFormData({...formData, ttl: e.target.value as number})}
                  >
                    {ttlOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>How long should this workspace remain active?</FormHelperText>
                </FormControl>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Team Members */}
        <Card elevation={2} sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Group sx={{ mr: 1, color: 'secondary.main' }} />
              <Typography variant="h5" component="h2" fontWeight="bold">
                Team Members
              </Typography>
            </Box>

            {/* Add Member Form */}
            <Paper elevation={1} sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="email"
                    label="Email Address"
                    value={newMember.email}
                    onChange={(e) => setNewMember({...newMember, email: e.target.value})}
                    helperText="Enter team member's email address"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel>Role</InputLabel>
                    <Select
                      value={newMember.role}
                      label="Role"
                      onChange={(e: SelectChangeEvent<'Owner' | 'Contributor'>) => setNewMember({...newMember, role: e.target.value as 'Owner' | 'Contributor'})}
                    >
                      <MenuItem value="Owner">Owner</MenuItem>
                      <MenuItem value="Contributor">Contributor</MenuItem>
                    </Select>
                    <FormHelperText>Select member's access level</FormHelperText>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={2}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<Add />}
                    onClick={addMember}
                    disabled={!newMember.email}
                  >
                    Add
                  </Button>
                </Grid>
              </Grid>
            </Paper>

            {/* Members List */}
            {formData.members.length > 0 ? (
              <Box>
                <Typography variant="subtitle1" gutterBottom fontWeight="medium">
                  Team Members ({formData.members.length})
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {formData.members.map((member) => (
                    <Paper key={member.email} elevation={1} sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                            {member.email[0].toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography variant="body1" fontWeight="medium">
                              {member.email}
                              {member.email === 'current.user@company.com' && (
                                <Chip
                                  label="You"
                                  size="small"
                                  color="success"
                                  variant="filled"
                                  sx={{ ml: 1, fontSize: '0.7rem' }}
                                />
                              )}
                            </Typography>
                            <Chip
                              label={member.role}
                              size="small"
                              color={member.role === 'Owner' ? 'primary' : 'secondary'}
                              variant="outlined"
                            />
                          </Box>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <FormControl size="small" sx={{ minWidth: 120 }}>
                            <Select
                              value={member.role}
                              onChange={(e: SelectChangeEvent<'Owner' | 'Contributor'>) => updateMemberRole(member.email, e.target.value as 'Owner' | 'Contributor')}
                            >
                              <MenuItem value="Owner">Owner</MenuItem>
                              <MenuItem value="Contributor">Contributor</MenuItem>
                            </Select>
                          </FormControl>
                          <IconButton
                            onClick={() => removeMember(member.email)}
                            color="error"
                            size="small"
                            disabled={member.email === 'current.user@company.com'}
                            title={member.email === 'current.user@company.com' ? 'Cannot remove yourself' : 'Remove member'}
                          >
                            <Delete />
                          </IconButton>
                        </Box>
                      </Box>
                    </Paper>
                  ))}
                </Box>
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 3, color: 'text.secondary' }}>
                <Group sx={{ fontSize: 48, mb: 1, opacity: 0.5 }} />
                <Typography variant="body1">
                  No team members added yet. Add team members to collaborate on this workspace.
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>


        {/* Actions */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            size="large"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            size="large"
            startIcon={<Folder />}
          >
            Create Workspace
          </Button>
        </Box>
      </Box>
    </Box>
    </AuthGuard>
  )
}