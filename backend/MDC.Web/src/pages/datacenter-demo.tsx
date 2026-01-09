'use client';

import React from 'react';
import {
  Container,
  Paper,
  Box,
  Typography,
  Alert,
  AlertTitle,
} from '@mui/material';
import { DatacenterOverview } from '../components/DatacenterOverview';
import { DatacenterService } from '../services/datacenterService';
import { sampleDatacenterData } from '../utils/sampleData';

const DatacenterDemoPage: React.FC = () => {
  const summary = DatacenterService.calculateSummary(sampleDatacenterData);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Alert severity="info" sx={{ mb: 3 }}>
          <AlertTitle>Demo Page</AlertTitle>
          This is a demo page showing the datacenter overview with sample data. 
          In production, this data would come from the API.
        </Alert>
        
        <Box mb={3}>
          <Typography variant="h4" component="h1" gutterBottom>
            Datacenter Demo
          </Typography>
          <Typography variant="body2" color="textSecondary">
            This page demonstrates the datacenter overview functionality with sample data.
          </Typography>
        </Box>

        <DatacenterOverview 
          datacenter={sampleDatacenterData} 
          summary={summary} 
        />
      </Paper>
    </Container>
  );
};

export default DatacenterDemoPage;