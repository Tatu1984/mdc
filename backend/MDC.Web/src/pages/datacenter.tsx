'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  CircularProgress,
  Alert,
  Box,
  Typography,
  Button,
  Breadcrumbs,
  Link,
} from '@mui/material';
import { Refresh, Home } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { DatacenterOverview } from '../components/DatacenterOverview';
import { DatacenterService } from '../services/datacenterService';
import { Datacenter, DatacenterSummary } from '../types/datacenter';
import { USER_ROLES } from '../constants/userRoles';

const DatacenterPage: React.FC = () => {
  const [datacenter, setDatacenter] = useState<Datacenter | null>(null);
  const [summary, setSummary] = useState<DatacenterSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { username } = useAuth();

  const fetchDatacenter = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const datacenterData = await DatacenterService.getDatacenter();
      const summaryData = DatacenterService.calculateSummary(datacenterData);
      
      setDatacenter(datacenterData);
      setSummary(summaryData);
    } catch (err) {
      console.error('Failed to fetch datacenter data:', err);
      setError(
        err instanceof Error 
          ? err.message 
          : 'Failed to load datacenter information. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatacenter();
  }, []);

  const handleRefresh = () => {
    fetchDatacenter();
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box 
          display="flex" 
          justifyContent="center" 
          alignItems="center" 
          minHeight="50vh"
          flexDirection="column"
          gap={2}
        >
          <CircularProgress size={60} />
          <Typography variant="h6" color="textSecondary">
            Loading datacenter information...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Alert 
            severity="error" 
            action={
              <Button
                color="inherit"
                size="small"
                onClick={handleRefresh}
                startIcon={<Refresh />}
              >
                Retry
              </Button>
            }
          >
            <Typography variant="h6" gutterBottom>
              Error Loading Datacenter
            </Typography>
            {error}
          </Alert>
        </Paper>
      </Container>
    );
  }

  if (!datacenter || !summary) {
    return (
      <Container maxWidth="lg" >
        <Paper>
          <Alert severity="warning">
            <Typography variant="h6" gutterBottom>
              No Datacenter Data
            </Typography>
            No datacenter information is available at this time.
          </Alert>
        </Paper>
      </Container>
    );
  }

  return (
    
      <Paper sx={{ p: 4 }}>
        {/* Breadcrumbs */}
        <Box mb={3}>
          <Breadcrumbs aria-label="breadcrumb">
            <Link color="inherit" href="/" sx={{ display: 'flex', alignItems: 'center' }}>
              <Home sx={{ mr: 0.5 }} fontSize="inherit" /> Home
            </Link>
            <Typography color="textPrimary" sx={{ display: 'flex', alignItems: 'center' }}>
              Datacenter
            </Typography>
          </Breadcrumbs>
        </Box>

        {/* Header with Refresh Button */}
        <Box 
          display="flex" 
          justifyContent="space-between" 
          alignItems="center" 
          mb={3}
        >
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              {datacenter.Name} Datacenter Overview
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Welcome, {username}! Here&apos;s your datacenter information.
            </Typography>
          </Box>
          <Button
            variant="outlined"
            onClick={handleRefresh}
            startIcon={<Refresh />}
            disabled={loading}
          >
            Refresh
          </Button>
        </Box>

        {/* Main Content */}
        <DatacenterOverview 
          datacenter={datacenter} 
          summary={summary} 
        />
      </Paper>
    
  );
};

// Wrap the component with protection requiring WorkspaceTenant role or higher
const ProtectedDatacenterPage: React.FC = () => (
  <ProtectedRoute requiredRoles={[USER_ROLES.WORKSPACE_TENANT]}>
    <DatacenterPage />
  </ProtectedRoute>
);

export default ProtectedDatacenterPage;