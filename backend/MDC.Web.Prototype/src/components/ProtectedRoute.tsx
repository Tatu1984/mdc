'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Box, CircularProgress, Typography, Button, Paper } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import { UserRole } from '@/constants/userRoles';

/**
 * Props for ProtectedRoute component
 */
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
  requireAll?: boolean;
}

/**
 * ProtectedRoute Component
 * Wraps content that requires authentication and optionally specific roles
 *
 * @param children - Content to render if authorized
 * @param requiredRoles - Array of roles required to access the content
 * @param requireAll - If true, user must have ALL required roles. If false, user needs ANY role (default: false)
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles = [],
  requireAll = false,
}) => {
  const { isAuthenticated, isLoading, userRoles, login } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="60vh"
        gap={2}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary">
          Loading authentication...
        </Typography>
      </Box>
    );
  }

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="60vh"
        gap={3}
        px={2}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            maxWidth: 500,
            textAlign: 'center',
            borderRadius: 2,
          }}
        >
          <LockIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Authentication Required
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            You need to be signed in to access this page.
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
      </Box>
    );
  }

  // Check role-based access if roles are specified
  if (requiredRoles.length > 0) {
    const hasAccess = requireAll
      ? requiredRoles.every((role) => userRoles.includes(role))
      : requiredRoles.some((role) => userRoles.includes(role));

    if (!hasAccess) {
      return (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight="60vh"
          gap={3}
          px={2}
        >
          <Paper
            elevation={3}
            sx={{
              p: 4,
              maxWidth: 500,
              textAlign: 'center',
              borderRadius: 2,
            }}
          >
            <LockIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Access Denied
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              You do not have the required permissions to access this page.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Required role{requiredRoles.length > 1 ? 's' : ''}:{' '}
              <strong>{requiredRoles.join(', ')}</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Your role{userRoles.length > 1 ? 's' : ''}:{' '}
              <strong>{userRoles.join(', ') || 'None'}</strong>
            </Typography>
          </Paper>
        </Box>
      );
    }
  }

  // User is authenticated and has required roles
  return <>{children}</>;
};

export default ProtectedRoute;
