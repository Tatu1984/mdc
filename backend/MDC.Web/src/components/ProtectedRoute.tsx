'use client';

import React, { ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../constants/userRoles';
import { Box, CircularProgress, Typography, Button } from '@mui/material';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: UserRole[];
  fallback?: ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRoles = [], 
  fallback 
}) => {
  const { isAuthenticated, isLoading, hasAnyRole, login } = useAuth();

  if (isLoading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="50vh"
        flexDirection="column"
        gap={2}
      >
        <CircularProgress />
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  if (!isAuthenticated) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="50vh"
        flexDirection="column"
        gap={2}
      >
        <Typography variant="h5">Authentication Required</Typography>
        <Typography>You need to be logged in to access this page.</Typography>
        <Button variant="contained" onClick={login}>
          Login
        </Button>
      </Box>
    );
  }

  if (requiredRoles.length > 0 && !hasAnyRole(requiredRoles)) {
    if (fallback) {
      return <>{fallback}</>;
    }
    
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="50vh"
        flexDirection="column"
        gap={2}
      >
        <Typography variant="h5">Access Denied</Typography>
        <Typography>
          You don&apos;t have the required permissions to access this page.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Required roles: {requiredRoles.join(', ')}
        </Typography>
      </Box>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;