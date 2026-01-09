'use client';

import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  DataUsage,
  Computer,
  NetworkCheck,
  People,
  DeviceHub,
  Storage,
} from '@mui/icons-material';
import { Datacenter, DatacenterSummary } from '../types/datacenter';

interface DatacenterOverviewProps {
  datacenter: Datacenter;
  summary: DatacenterSummary;
}

const StatCard: React.FC<{
  title: string;
  value: number;
  icon: React.ReactNode;
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
}> = ({ title, value, icon, color }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography color="textSecondary" gutterBottom variant="body2">
            {title}
          </Typography>
          <Typography variant="h4" component="div">
            {value}
          </Typography>
        </Box>
        <Box 
          sx={{ 
            color: `${color}.main`,
            display: 'flex',
            alignItems: 'center',
            fontSize: '3rem'
          }}
        >
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

export const DatacenterOverview: React.FC<DatacenterOverviewProps> = ({
  datacenter,
  summary,
}) => {
  return (
    <Box>
      {/* Header Section */}
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          {datacenter.Name}
        </Typography>
        <Typography variant="body1" color="textSecondary" paragraph>
          {datacenter.Description || 'No description available'}
        </Typography>
      </Box>

      {/* Summary Statistics */}
      <Grid container spacing={3} mb={4}>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <StatCard
            title="Workspaces"
            value={summary.totalWorkspaces}
            icon={<DataUsage />}
            color="primary"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <StatCard
            title="Virtual Machines"
            value={summary.totalVirtualMachines}
            icon={<Computer />}
            color="secondary"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <StatCard
            title="Virtual Networks"
            value={summary.totalVirtualNetworks}
            icon={<NetworkCheck />}
            color="success"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <StatCard
            title="Users"
            value={summary.totalUsers}
            icon={<People />}
            color="warning"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <StatCard
            title="Devices"
            value={summary.totalDevices}
            icon={<DeviceHub />}
            color="info"
          />
        </Grid>
      </Grid>

      {/* Detailed Information */}
      <Grid container spacing={3}>
        {/* Templates Section */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <Storage sx={{ mr: 1, verticalAlign: 'middle' }} />
                Virtual Machine Templates
              </Typography>
              
              <Box mb={2}>
                <Typography variant="subtitle2" color="textSecondary">
                  Gateway Templates ({datacenter.GatewayTemplates?.length})
                </Typography>
                {datacenter.GatewayTemplates?.length > 0 ? (
                  <Box mt={1}>
                    {datacenter.GatewayTemplates.map((template, index) => (
                      <Chip
                        key={index}
                        label={template.name}
                        size="small"
                        sx={{ mr: 1, mb: 1 }}
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" color="textSecondary">
                    No gateway templates configured
                  </Typography>
                )}
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box mb={2}>
                <Typography variant="subtitle2" color="textSecondary">
                  Bastion Templates ({datacenter.BastionTemplates?.length})
                </Typography>
                {datacenter.BastionTemplates?.length > 0 ? (
                  <Box mt={1}>
                    {datacenter.BastionTemplates.map((template, index) => (
                      <Chip
                        key={index}
                        label={template.name}
                        size="small"
                        sx={{ mr: 1, mb: 1 }}
                        color="secondary"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" color="textSecondary">
                    No bastion templates configured
                  </Typography>
                )}
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box>
                <Typography variant="subtitle2" color="textSecondary">
                  VM Templates ({datacenter.VirtualMachineTemplates?.length})
                </Typography>
                {datacenter.VirtualMachineTemplates?.length > 0 ? (
                  <Box mt={1}>
                    {datacenter.VirtualMachineTemplates.map((template, index) => (
                      <Chip
                        key={index}
                        label={template.name}
                        size="small"
                        sx={{ mr: 1, mb: 1 }}
                        color="success"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" color="textSecondary">
                    No VM templates configured
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Workspaces List */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <DataUsage sx={{ mr: 1, verticalAlign: 'middle' }} />
                Workspaces
              </Typography>
              
              {datacenter.Workspaces?.length > 0 ? (
                <List dense>
                  {datacenter.Workspaces.slice(0, 10).map((workspace) => (
                    <ListItem key={workspace.id} divider>
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" justifyContent="space-between">
                            <Typography variant="subtitle2">
                              {workspace.name}
                            </Typography>
                            <Chip
                              label={`Address: ${workspace.address}`}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="textSecondary">
                              {workspace.description || 'No description'}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              VMs: {workspace.virtualMachines.length} | 
                              Networks: {workspace.virtualNetworks.length} | 
                              Users: {workspace.users.length}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                  {datacenter.Workspaces.length > 10 && (
                    <ListItem>
                      <ListItemText
                        primary={
                          <Typography variant="body2" color="textSecondary" align="center">
                            ... and {datacenter.Workspaces.length - 10} more workspaces
                          </Typography>
                        }
                      />
                    </ListItem>
                  )}
                </List>
              ) : (
                <Typography variant="body2" color="textSecondary">
                  No workspaces configured
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Device Configurations */}
        {datacenter.DeviceConfigurations?.length > 0 && (
          <Grid size={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <DeviceHub sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Device Configurations
                </Typography>
                <Box>
                  {datacenter.DeviceConfigurations.map((config, index) => (
                    <Chip
                      key={index}
                      label={config.name}
                      size="small"
                      sx={{ mr: 1, mb: 1 }}
                      color="info"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default DatacenterOverview;