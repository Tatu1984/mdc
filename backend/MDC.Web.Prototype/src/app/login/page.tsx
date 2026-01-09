'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Container,
} from '@mui/material';
import LoginIcon from '@mui/icons-material/Login';
import SecurityIcon from '@mui/icons-material/Security';

/**
 * Login Page Component
 * Handles user authentication through Keycloak
 */
export default function LoginPage() {
  const { isAuthenticated, isLoading, login } = useAuth();
  const router = useRouter();

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading state during authentication check
  if (isLoading) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
        gap={2}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary">
          Checking authentication...
        </Typography>
      </Box>
    );
  }

  // Show login page if not authenticated
  return (
    <Container maxWidth="sm">
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
        py={4}
      >
        <Card
          sx={{
            width: '100%',
            maxWidth: 500,
            boxShadow: 3,
            borderRadius: 2,
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              gap={3}
            >
              {/* Logo/Icon */}
              <Box
                sx={{
                  bgcolor: 'primary.main',
                  borderRadius: '50%',
                  p: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <SecurityIcon sx={{ fontSize: 48, color: 'white' }} />
              </Box>

              {/* Title */}
              <Typography variant="h4" component="h1" fontWeight="bold">
                Micro Datacenter
              </Typography>

              <Typography
                variant="body1"
                color="text.secondary"
                textAlign="center"
              >
                Sign in to access your workspaces and manage your datacenter
                infrastructure
              </Typography>

              {/* Login Button */}
              <Button
                variant="contained"
                size="large"
                fullWidth
                startIcon={<LoginIcon />}
                onClick={login}
                sx={{ mt: 2, py: 1.5 }}
              >
                Sign In with Keycloak
              </Button>

              {/* Info Section */}
              <Box
                sx={{
                  mt: 3,
                  p: 2,
                  bgcolor: 'background.default',
                  borderRadius: 1,
                  width: '100%',
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  <strong>Secure Authentication</strong>
                  <br />
                  This application uses Keycloak for enterprise-grade
                  authentication and authorization. Your credentials are never
                  stored in this application.
                </Typography>
              </Box>

              {/* Features List */}
              <Box sx={{ width: '100%', mt: 2 }}>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  gutterBottom
                >
                  Features:
                </Typography>
                <ul
                  style={{
                    margin: 0,
                    paddingLeft: 20,
                    color: 'rgba(0, 0, 0, 0.6)',
                  }}
                >
                  <li>Workspace management</li>
                  <li>Datacenter infrastructure monitoring</li>
                  <li>Runbook automation</li>
                  <li>Role-based access control</li>
                </ul>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Footer */}
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 4, textAlign: 'center' }}
        >
          Protected by Keycloak OAuth 2.0 / OpenID Connect
        </Typography>
      </Box>
    </Container>
  );
}
