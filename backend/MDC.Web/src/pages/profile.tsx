'use client';

import React, { useState } from 'react';
import { 
  Box, 
  Container,
  Typography, 
  TextField, 
  Button, 
  Chip, 
  Grid, 
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import { Person, VpnKey, Security, ContentCopy, Refresh, Code } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { getToken } from '../config/keycloak';
import ProtectedRoute from '../components/ProtectedRoute';
import { USER_ROLES } from '../constants/userRoles';

const ProfilePage: React.FC = () => {
  const { userInfo, isLoading } = useAuth();
  
  // API Token state
  const [currentToken, setCurrentToken] = useState('');
  const [tokenCopied, setTokenCopied] = useState(false);
  const [isRefreshingToken, setIsRefreshingToken] = useState(false);

  // Load current token on component mount
  React.useEffect(() => {
    const token = getToken();
    if (token) {
      setCurrentToken(token);
    }
  }, []);

  const handleRefreshToken = async () => {
    setIsRefreshingToken(true);
    try {
      // Force refresh the token
      const { updateToken } = await import('../config/keycloak');
      await updateToken(() => {
        const newToken = getToken();
        if (newToken) {
          setCurrentToken(newToken);
        }
      });
    } catch (error) {
      console.error('Failed to refresh token:', error);
    } finally {
      setIsRefreshingToken(false);
    }
  };

  const handleCopyToken = async () => {
    try {
      await navigator.clipboard.writeText(currentToken);
      setTokenCopied(true);
      setTimeout(() => setTokenCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy token:', error);
    }
  };

  const formatTokenForDisplay = (token: string) => {
    if (!token) return 'No token available';
    if (token.length <= 50) return token;
    return `${token.substring(0, 25)}...${token.substring(token.length - 25)}`;
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <ProtectedRoute requiredRoles={[USER_ROLES.WORKSPACE_TENANT]}>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4 }}>
          User Profile
        </Typography>

        <Grid container spacing={3}>
          {/* User Information Card */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={3}>
                  <Person sx={{ mr: 2, color: 'primary.main' }} />
                  <Typography variant="h6">Personal Information</Typography>
                </Box>

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Username"
                      value={userInfo?.username || 'N/A'}
                      InputProps={{ readOnly: true }}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Email"
                      value={userInfo?.email || 'N/A'}
                      InputProps={{ readOnly: true }}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="First Name"
                      value={userInfo?.firstName || 'N/A'}
                      InputProps={{ readOnly: true }}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      value={userInfo?.lastName || 'N/A'}
                      InputProps={{ readOnly: true }}
                      variant="outlined"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Roles and API Key Card */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={3}>
                  <Security sx={{ mr: 2, color: 'primary.main' }} />
                  <Typography variant="h6">Access & Permissions</Typography>
                </Box>

                <Typography variant="subtitle2" gutterBottom>
                  Assigned Roles
                </Typography>
                <Box mb={3}>
                  {userInfo?.roles && userInfo.roles.length > 0 ? (
                    userInfo.roles.map((role) => (
                      <Chip
                        key={role}
                        label={role}
                        variant="outlined"
                        color="primary"
                        size="small"
                        sx={{ mr: 1, mb: 1 }}
                      />
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No roles assigned
                    </Typography>
                  )}
                </Box>

                {userInfo?.apiKey && (
                  <>
                    <Typography variant="subtitle2" gutterBottom>
                      API Key
                    </Typography>
                    <TextField
                      fullWidth
                      value={userInfo.apiKey}
                      InputProps={{ 
                        readOnly: true,
                        startAdornment: <VpnKey sx={{ mr: 1, color: 'text.secondary' }} />
                      }}
                      variant="outlined"
                      size="small"
                      sx={{ fontFamily: 'monospace' }}
                    />
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* API Token Card */}
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={3}>
                  <Code sx={{ mr: 2, color: 'primary.main' }} />
                  <Typography variant="h6">API Access Token</Typography>
                </Box>
                <Divider sx={{ mb: 3 }} />

                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Use this token to authenticate API requests. Copy the token and include it in the Authorization header as &quot;Bearer &lt;token&gt;&quot;.
                </Typography>

                <Alert severity="info" sx={{ mb: 3 }}>
                  <Typography variant="body2">
                    <strong>Example Usage:</strong><br />
                    <code style={{ background: '#f5f5f5', padding: '2px 4px', borderRadius: '4px' }}>
                      curl -H &quot;Authorization: Bearer YOUR_TOKEN&quot; https://localhost:8081/odata/Datacenter
                    </code>
                  </Typography>
                </Alert>

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label="Current Access Token"
                      value={formatTokenForDisplay(currentToken)}
                      InputProps={{ 
                        readOnly: true,
                        style: { fontFamily: 'monospace', fontSize: '0.875rem' }
                      }}
                      variant="outlined"
                      multiline
                      minRows={2}
                      maxRows={4}
                    />
                  </Grid>
                </Grid>

                <Box mt={3} display="flex" gap={2} flexWrap="wrap">
                  <Button
                    variant="outlined"
                    onClick={handleCopyToken}
                    startIcon={<ContentCopy />}
                    disabled={!currentToken}
                    color={tokenCopied ? 'success' : 'primary'}
                  >
                    {tokenCopied ? 'Copied!' : 'Copy Token'}
                  </Button>

                  <Button
                    variant="outlined"
                    onClick={handleRefreshToken}
                    startIcon={isRefreshingToken ? <CircularProgress size={16} /> : <Refresh />}
                    disabled={isRefreshingToken}
                  >
                    {isRefreshingToken ? 'Refreshing...' : 'Refresh Token'}
                  </Button>
                </Box>

                <Box mt={3}>
                  <Typography variant="subtitle2" gutterBottom>
                    Token Information
                  </Typography>
                  <Grid container spacing={1}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Type:</strong> Bearer JWT Token
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Expires:</strong> 1 hour after generation
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Scope:</strong> All user permissions
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="body2" color="text.secondary">
                        <strong>API Base URL:</strong> https://localhost:8081
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>

                {userInfo?.apiKey && (
                  <Box mt={3}>
                    <Divider sx={{ mb: 2 }} />
                    <Typography variant="subtitle2" gutterBottom>
                      Alternative: API Key Authentication
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      You can also use your personal API key for simpler authentication:
                    </Typography>
                    <TextField
                      fullWidth
                      label="Personal API Key"
                      value={userInfo.apiKey}
                      InputProps={{ 
                        readOnly: true,
                        style: { fontFamily: 'monospace' }
                      }}
                      variant="outlined"
                      size="small"
                    />
                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                      Use with header: <code>X-API-Key: {userInfo.apiKey}</code>
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </ProtectedRoute>
  );
};

export default ProfilePage;