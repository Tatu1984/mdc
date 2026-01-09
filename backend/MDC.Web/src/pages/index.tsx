import React from "react";
import { Typography, Button, Paper, Box, Container, Card, CardContent, CardActions } from '@mui/material';
import { Computer, Dashboard, People, Settings } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import Link from 'next/link';

export default function Home() {
  const { isAuthenticated, username, login } = useAuth();

  if (!isAuthenticated) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom>
            Welcome to MicroDataCenter
          </Typography>
          <Typography variant="body1" color="textSecondary" paragraph>
            Please sign in to access your datacenter management dashboard.
          </Typography>
          <Button 
            variant="contained" 
            size="large" 
            onClick={login}
            sx={{ mt: 2 }}
          >
            Sign In
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome back, {username}!
        </Typography>
        <Typography variant="body1" color="textSecondary" paragraph>
          Manage your micro datacenter infrastructure from this dashboard.
        </Typography>

        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Quick Actions
          </Typography>
          
          <Box 
            sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
              gap: 2,
              mt: 2 
            }}
          >
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Dashboard sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Datacenter Overview
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  View datacenter statistics and health
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'center' }}>
                <Link href="/datacenter" passHref>
                  <Button size="small" variant="contained">
                    View Details
                  </Button>
                </Link>
              </CardActions>
            </Card>

            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Computer sx={{ fontSize: 40, color: 'secondary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Workspaces
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Manage virtual workspaces
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'center' }}>
                <Button size="small" disabled>
                  Coming Soon
                </Button>
              </CardActions>
            </Card>

            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <People sx={{ fontSize: 40, color: 'success.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Users
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Manage user access and permissions
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'center' }}>
                <Button size="small" disabled>
                  Coming Soon
                </Button>
              </CardActions>
            </Card>

            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Settings sx={{ fontSize: 40, color: 'warning.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Settings
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Configure system preferences
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'center' }}>
                <Button size="small" disabled>
                  Coming Soon
                </Button>
              </CardActions>
            </Card>
          </Box>
        </Box>
      </Paper>

  );
}
