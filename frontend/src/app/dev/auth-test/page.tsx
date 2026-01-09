'use client'

import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Paper,
  Chip,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material'
import {
  Security,
  CheckCircle,
  Cancel,
  PlayArrow,
  Refresh,
  ExpandMore,
  ContentCopy,
  Person,
  AdminPanelSettings,
  Engineering,
  ManageAccounts,
  Groups,
  Public
} from '@mui/icons-material'
import AuthGuard from '@/components/AuthGuard'
import { useAuth } from '@/hooks/useAuth'
import { apiClient, setAccessToken } from '@/services/apiClient'
import { env } from '@/config/env'

interface TestResult {
  endpoint: string
  status: 'idle' | 'loading' | 'success' | 'error'
  statusCode?: number
  data?: any
  error?: string
  duration?: number
}

interface AuthTestEndpoint {
  name: string
  endpoint: string
  description: string
  icon: React.ReactNode
  requiredRole?: string
}

const testEndpoints: AuthTestEndpoint[] = [
  {
    name: 'Anonymous',
    endpoint: '/api/AuthTest/anonymous',
    description: 'Accessible without authentication',
    icon: <Public />,
  },
  {
    name: 'Authenticated',
    endpoint: '/api/AuthTest/authenticated',
    description: 'Requires any valid authentication',
    icon: <Person />,
  },
  {
    name: 'Admin Only',
    endpoint: '/api/AuthTest/admin',
    description: 'Requires GlobalAdministrator role',
    icon: <AdminPanelSettings />,
    requiredRole: 'GlobalAdministrator',
  },
  {
    name: 'Technician Only',
    endpoint: '/api/AuthTest/technician',
    description: 'Requires DatacenterTechnician role',
    icon: <Engineering />,
    requiredRole: 'DatacenterTechnician',
  },
  {
    name: 'Manager Only',
    endpoint: '/api/AuthTest/manager',
    description: 'Requires WorkspaceManager role',
    icon: <ManageAccounts />,
    requiredRole: 'WorkspaceManager',
  },
  {
    name: 'User Only',
    endpoint: '/api/AuthTest/user',
    description: 'Requires WorkspaceUser role',
    icon: <Groups />,
    requiredRole: 'WorkspaceUser',
  },
]

export default function AuthTestPage() {
  const { isAuthenticated, user, getAccessToken } = useAuth()
  const [token, setToken] = useState<string | null>(null)
  const [tokenError, setTokenError] = useState<string | null>(null)
  const [tokenLoading, setTokenLoading] = useState(false)
  const [testResults, setTestResults] = useState<Record<string, TestResult>>({})
  const [copiedToken, setCopiedToken] = useState(false)

  // Initialize test results
  useEffect(() => {
    const initialResults: Record<string, TestResult> = {}
    testEndpoints.forEach((ep) => {
      initialResults[ep.endpoint] = {
        endpoint: ep.endpoint,
        status: 'idle',
      }
    })
    setTestResults(initialResults)
  }, [])

  // Fetch access token
  const fetchToken = async () => {
    setTokenLoading(true)
    setTokenError(null)
    try {
      const accessToken = await getAccessToken()
      setToken(accessToken)
      if (accessToken) {
        setAccessToken(accessToken)
      } else {
        setTokenError('Token acquisition returned null. Check browser console for details.')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      setTokenError(errorMessage)
      console.error('Failed to get access token:', error)
    } finally {
      setTokenLoading(false)
    }
  }

  // Auto-fetch token when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchToken()
    }
  }, [isAuthenticated])

  // Copy token to clipboard
  const copyToken = async () => {
    if (token) {
      await navigator.clipboard.writeText(token)
      setCopiedToken(true)
      setTimeout(() => setCopiedToken(false), 2000)
    }
  }

  // Test a single endpoint
  const testEndpoint = async (endpoint: string) => {
    setTestResults((prev) => ({
      ...prev,
      [endpoint]: { ...prev[endpoint], status: 'loading' },
    }))

    const startTime = performance.now()

    try {
      const response = await apiClient.get(endpoint)
      const duration = Math.round(performance.now() - startTime)

      setTestResults((prev) => ({
        ...prev,
        [endpoint]: {
          endpoint,
          status: response.ok ? 'success' : 'error',
          statusCode: response.status,
          data: response.data,
          error: response.error,
          duration,
        },
      }))
    } catch (error) {
      const duration = Math.round(performance.now() - startTime)
      setTestResults((prev) => ({
        ...prev,
        [endpoint]: {
          endpoint,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
          duration,
        },
      }))
    }
  }

  // Test all endpoints
  const testAllEndpoints = async () => {
    for (const ep of testEndpoints) {
      await testEndpoint(ep.endpoint)
    }
  }

  // Reset all tests
  const resetTests = () => {
    const resetResults: Record<string, TestResult> = {}
    testEndpoints.forEach((ep) => {
      resetResults[ep.endpoint] = {
        endpoint: ep.endpoint,
        status: 'idle',
      }
    })
    setTestResults(resetResults)
  }

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return 'success'
      case 'error':
        return 'error'
      case 'loading':
        return 'info'
      default:
        return 'default'
    }
  }

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle color="success" />
      case 'error':
        return <Cancel color="error" />
      case 'loading':
        return <CircularProgress size={20} />
      default:
        return null
    }
  }

  return (
    <AuthGuard>
      <Box>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Security sx={{ color: 'primary.main', fontSize: '3rem' }} />
            <Box>
              <Typography variant="h3" component="h1" fontWeight="bold">
                Authentication Test
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Test API authentication and authorization endpoints
              </Typography>
            </Box>
          </Box>
        </Box>

        <Grid container spacing={3}>
          {/* Configuration Info */}
          <Grid item xs={12}>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="body1" fontWeight="medium">
                  Configuration Details
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold', width: 200 }}>SPA Client ID</TableCell>
                      <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                        {env.MSAL_CLIENT_ID || 'Not set'}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Authority</TableCell>
                      <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                        {env.MSAL_AUTHORITY || 'Not set'}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>API Scope</TableCell>
                      <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                        {env.API_SCOPE || 'Not set'}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>API URL</TableCell>
                      <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                        {env.API_URL || 'Not set'}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </AccordionDetails>
            </Accordion>
          </Grid>

          {/* User Info Card */}
          <Grid item xs={12} md={4}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Current User
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Status
                    </Typography>
                    <Chip
                      label={isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
                      color={isAuthenticated ? 'success' : 'error'}
                      size="small"
                    />
                  </Box>
                  {user && (
                    <>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Name
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {user.name}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Email
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {user.email}
                        </Typography>
                      </Box>
                    </>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Token Card */}
          <Grid item xs={12} md={8}>
            <Card elevation={2}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" fontWeight="bold">
                    Access Token
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Refresh />}
                      onClick={fetchToken}
                      disabled={tokenLoading || !isAuthenticated}
                    >
                      Refresh Token
                    </Button>
                    <Tooltip title={copiedToken ? 'Copied!' : 'Copy to clipboard'}>
                      <span>
                        <IconButton
                          size="small"
                          onClick={copyToken}
                          disabled={!token}
                          color={copiedToken ? 'success' : 'default'}
                        >
                          <ContentCopy />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Box>
                </Box>
                {tokenLoading ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <CircularProgress size={20} />
                    <Typography variant="body2">Fetching token...</Typography>
                  </Box>
                ) : token ? (
                  <>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        bgcolor: 'grey.100',
                        maxHeight: 100,
                        overflow: 'auto',
                        fontFamily: 'monospace',
                        fontSize: '0.75rem',
                        wordBreak: 'break-all',
                      }}
                    >
                      {token}
                    </Paper>
                    {/* Decoded Token Info */}
                    {(() => {
                      try {
                        const parts = token.split('.')
                        if (parts.length === 3) {
                          const payload = JSON.parse(atob(parts[1]))
                          return (
                            <Accordion sx={{ mt: 2 }}>
                              <AccordionSummary expandIcon={<ExpandMore />}>
                                <Typography variant="body2" fontWeight="medium">
                                  Decoded Token Payload
                                </Typography>
                              </AccordionSummary>
                              <AccordionDetails>
                                <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.100' }}>
                                  <pre style={{ margin: 0, fontSize: '0.75rem', overflow: 'auto' }}>
                                    {JSON.stringify(payload, null, 2)}
                                  </pre>
                                </Paper>
                                <Box sx={{ mt: 2 }}>
                                  <Typography variant="caption" color="text.secondary">
                                    Key Claims:
                                  </Typography>
                                  <Table size="small">
                                    <TableBody>
                                      <TableRow>
                                        <TableCell sx={{ fontWeight: 'bold', width: 120 }}>Audience (aud)</TableCell>
                                        <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                                          {payload.aud || 'N/A'}
                                        </TableCell>
                                      </TableRow>
                                      <TableRow>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Issuer (iss)</TableCell>
                                        <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                                          {payload.iss || 'N/A'}
                                        </TableCell>
                                      </TableRow>
                                      <TableRow>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Scopes (scp)</TableCell>
                                        <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                                          {payload.scp || 'N/A'}
                                        </TableCell>
                                      </TableRow>
                                      <TableRow>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Roles</TableCell>
                                        <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                                          {payload.roles ? payload.roles.join(', ') : 'N/A'}
                                        </TableCell>
                                      </TableRow>
                                      <TableRow>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Expires</TableCell>
                                        <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                                          {payload.exp ? new Date(payload.exp * 1000).toLocaleString() : 'N/A'}
                                        </TableCell>
                                      </TableRow>
                                    </TableBody>
                                  </Table>
                                </Box>
                              </AccordionDetails>
                            </Accordion>
                          )
                        }
                        return null
                      } catch {
                        return null
                      }
                    })()}
                  </>
                ) : tokenError ? (
                  <Alert severity="error">
                    <Typography variant="body2" fontWeight="bold">Token Error:</Typography>
                    <Typography variant="body2">{tokenError}</Typography>
                  </Alert>
                ) : (
                  <Alert severity="info">
                    No token available. Make sure you are authenticated.
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Test Controls */}
          <Grid item xs={12}>
            <Card elevation={2}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" fontWeight="bold">
                    API Endpoint Tests
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      variant="outlined"
                      startIcon={<Refresh />}
                      onClick={resetTests}
                    >
                      Reset All
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<PlayArrow />}
                      onClick={testAllEndpoints}
                      disabled={!token}
                    >
                      Test All Endpoints
                    </Button>
                  </Box>
                </Box>

                {!token && (
                  <Alert severity="warning" sx={{ mb: 3 }}>
                    Please wait for the access token to be fetched before testing endpoints.
                  </Alert>
                )}

                {/* Endpoints Table */}
                <TableContainer component={Paper} elevation={0}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: 'grey.50' }}>
                        <TableCell sx={{ fontWeight: 'bold', width: 50 }}></TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Endpoint</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Required Role</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Duration</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {testEndpoints.map((ep) => {
                        const result = testResults[ep.endpoint]
                        return (
                          <TableRow key={ep.endpoint} hover>
                            <TableCell>
                              <Box sx={{ color: 'primary.main' }}>{ep.icon}</Box>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body1" fontWeight="medium">
                                {ep.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" fontFamily="monospace">
                                {ep.endpoint}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">{ep.description}</Typography>
                            </TableCell>
                            <TableCell>
                              {ep.requiredRole ? (
                                <Chip
                                  label={ep.requiredRole}
                                  size="small"
                                  color="warning"
                                  variant="outlined"
                                />
                              ) : (
                                <Typography variant="body2" color="text.secondary">
                                  None
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {getStatusIcon(result?.status)}
                                {result?.statusCode && (
                                  <Chip
                                    label={result.statusCode}
                                    size="small"
                                    color={result.statusCode >= 200 && result.statusCode < 300 ? 'success' : 'error'}
                                  />
                                )}
                              </Box>
                            </TableCell>
                            <TableCell>
                              {result?.duration !== undefined && (
                                <Typography variant="body2" color="text.secondary">
                                  {result.duration}ms
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="outlined"
                                size="small"
                                startIcon={<PlayArrow />}
                                onClick={() => testEndpoint(ep.endpoint)}
                                disabled={result?.status === 'loading' || !token}
                              >
                                Test
                              </Button>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Test Results Details */}
          <Grid item xs={12}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Response Details
                </Typography>

                {testEndpoints.map((ep) => {
                  const result = testResults[ep.endpoint]
                  if (!result || result.status === 'idle') return null

                  return (
                    <Accordion key={ep.endpoint} sx={{ mb: 1 }}>
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                          {getStatusIcon(result.status)}
                          <Typography fontWeight="medium">{ep.name}</Typography>
                          {result.statusCode && (
                            <Chip
                              label={`HTTP ${result.statusCode}`}
                              size="small"
                              color={getStatusColor(result.status) as any}
                            />
                          )}
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        {result.status === 'loading' ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <CircularProgress size={20} />
                            <Typography>Loading...</Typography>
                          </Box>
                        ) : result.status === 'error' ? (
                          <Alert severity="error">
                            <Typography variant="body2" fontWeight="bold">
                              Error:
                            </Typography>
                            <Typography variant="body2">{result.error}</Typography>
                          </Alert>
                        ) : (
                          <Box>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Response Data:
                            </Typography>
                            <Paper
                              elevation={0}
                              sx={{
                                p: 2,
                                bgcolor: 'grey.100',
                                maxHeight: 300,
                                overflow: 'auto',
                              }}
                            >
                              <pre style={{ margin: 0, fontFamily: 'monospace', fontSize: '0.8rem' }}>
                                {JSON.stringify(result.data, null, 2)}
                              </pre>
                            </Paper>

                            {/* Show claims if available */}
                            {result.data?.claims && (
                              <Box sx={{ mt: 2 }}>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                  Token Claims:
                                </Typography>
                                <TableContainer component={Paper} elevation={0}>
                                  <Table size="small">
                                    <TableHead>
                                      <TableRow sx={{ bgcolor: 'grey.50' }}>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Claim Type</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Value</TableCell>
                                      </TableRow>
                                    </TableHead>
                                    <TableBody>
                                      {result.data.claims.map((claim: { Type: string; Value: string }, index: number) => (
                                        <TableRow key={index}>
                                          <TableCell>
                                            <Typography variant="caption" fontFamily="monospace">
                                              {claim.Type}
                                            </Typography>
                                          </TableCell>
                                          <TableCell>
                                            <Typography variant="caption" fontFamily="monospace">
                                              {claim.Value}
                                            </Typography>
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </TableContainer>
                              </Box>
                            )}
                          </Box>
                        )}
                      </AccordionDetails>
                    </Accordion>
                  )
                })}

                {Object.values(testResults).every((r) => r.status === 'idle') && (
                  <Alert severity="info">
                    No tests have been run yet. Click "Test" on individual endpoints or "Test All Endpoints" to begin.
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </AuthGuard>
  )
}
