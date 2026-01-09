'use client'

import { useState, useEffect } from 'react'
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  Paper,
  Fade,
  Slide,
  Zoom,
  useTheme,
  alpha
} from '@mui/material'
import {
  Folder,
  Computer,
  DeveloperBoard,
  Description,
  RocketLaunch,
  Business,
  Settings,
  FiberManualRecord
} from '@mui/icons-material'
import Link from 'next/link'

export default function GetStartedPage() {
  const [isVisible, setIsVisible] = useState(false)
  const theme = useTheme()

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const concepts = [
    {
      title: "Workspaces",
      description: "Isolated environments where you organize and manage your projects. Each workspace contains its own set of virtual machines, configurations, and resources, providing complete separation between different projects or teams.",
      icon: <Folder sx={{ fontSize: 40 }} />,
      color: theme.palette.primary.main,
      bgColor: alpha(theme.palette.primary.main, 0.1)
    },
    {
      title: "Virtual Machines",
      description: "Computing resources within your workspaces. These virtualized servers can run different operating systems and applications, providing scalable and flexible infrastructure for development, testing, and deployment.",
      icon: <Computer sx={{ fontSize: 40 }} />,
      color: theme.palette.success.main,
      bgColor: alpha(theme.palette.success.main, 0.1)
    },
    {
      title: "Workstations",
      description: "Specialized development environments that provide direct access to your workspace resources. They include development tools, IDEs, and connectivity to your VMs, enabling seamless development workflows.",
      icon: <DeveloperBoard sx={{ fontSize: 40 }} />,
      color: theme.palette.secondary.main,
      bgColor: alpha(theme.palette.secondary.main, 0.1)
    },
    {
      title: "Runbooks",
      description: "Automated procedures and documentation that guide you through common tasks and operations. They provide step-by-step instructions for deployment, troubleshooting, and maintenance activities.",
      icon: <Description sx={{ fontSize: 40 }} />,
      color: theme.palette.warning.main,
      bgColor: alpha(theme.palette.warning.main, 0.1)
    }
  ]

  const steps = [
    {
      step: "1",
      title: "Create Your Workspace",
      description: "Set up your first workspace to organize your projects and resources.",
      color: theme.palette.primary.main
    },
    {
      step: "2",
      title: "Configure Resources",
      description: "Set up VM templates and configure your data center resources.",
      color: theme.palette.success.main
    },
    {
      step: "3",
      title: "Deploy & Test",
      description: "Use the testbed to deploy and test your applications.",
      color: theme.palette.secondary.main
    }
  ]

  const actions = [
    { href: "/workspace/create", text: "Create Workspace", icon: <RocketLaunch />, color: "primary" },
    { href: "/data-center", text: "Data Center", icon: <Business />, color: "secondary" },
    { href: "/runbooks", text: "View Runbooks", icon: <Description />, color: "warning" },
    { href: "/user", text: "Profile Settings", icon: <Settings />, color: "success" }
  ]

  return (
    <Box sx={{
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
      pb: 8
    }}>
      {/* Hero Section */}
      <Box sx={{
        position: 'relative',
        overflow: 'hidden',
        pt: 10,
        pb: 8,
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`
      }}>
        <Container maxWidth="lg">
          <Fade in={isVisible} timeout={1000}>
            <Box sx={{ textAlign: 'center' }}>
              <Chip
                icon={<FiberManualRecord sx={{ color: theme.palette.success.main, animation: 'pulse 2s infinite' }} />}
                label="Welcome to MicroDataCenter"
                sx={{
                  mb: 4,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  color: 'white',
                  fontWeight: 600,
                  px: 2,
                  py: 1,
                  '& .MuiChip-icon': {
                    color: 'white !important'
                  }
                }}
              />

              <Typography
                variant="h1"
                component="h1"
                sx={{
                  fontSize: { xs: '3rem', md: '5rem' },
                  fontWeight: 800,
                  background: `linear-gradient(135deg, ${theme.palette.text.primary}, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 3
                }}
              >
                Get Started
              </Typography>

              <Typography
                variant="h5"
                sx={{
                  color: theme.palette.text.secondary,
                  maxWidth: '800px',
                  mx: 'auto',
                  lineHeight: 1.6,
                  mb: 2
                }}
              >
                Your comprehensive platform for managing development and testing infrastructure.
              </Typography>

              <Typography
                variant="h6"
                sx={{
                  color: theme.palette.primary.main,
                  fontWeight: 600
                }}
              >
                Build, Deploy, Scale.
              </Typography>
            </Box>
          </Fade>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ pt: 6 }}>
        {/* Core Concepts Section */}
        <Box sx={{ mb: 10 }}>
          <Slide in={isVisible} direction="up" timeout={1200}>
            <Box sx={{ textAlign: 'center', mb: 8 }}>
              <Typography variant="h3" component="h2" sx={{ fontWeight: 700, mb: 2 }}>
                Core Concepts
              </Typography>
              <Box sx={{
                width: 80,
                height: 4,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                mx: 'auto',
                borderRadius: 2
              }} />
            </Box>
          </Slide>

          <Grid container spacing={4}>
            {concepts.map((concept, index) => (
              <Grid item xs={12} md={6} key={concept.title}>
                <Zoom in={isVisible} timeout={1000 + (index * 200)}>
                  <Card
                    sx={{
                      height: '100%',
                      transition: 'all 0.3s ease-in-out',
                      cursor: 'pointer',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: theme.shadows[12]
                      }
                    }}
                  >
                    <CardContent sx={{ p: 4 }}>
                      <Box
                        sx={{
                          width: 80,
                          height: 80,
                          borderRadius: 3,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mb: 3,
                          backgroundColor: concept.bgColor,
                          color: concept.color,
                          transition: 'transform 0.3s ease-in-out',
                          '&:hover': {
                            transform: 'scale(1.1)'
                          }
                        }}
                      >
                        {concept.icon}
                      </Box>

                      <Typography
                        variant="h5"
                        component="h3"
                        sx={{
                          fontWeight: 700,
                          mb: 2,
                          color: concept.color
                        }}
                      >
                        {concept.title}
                      </Typography>

                      <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                        {concept.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Zoom>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Getting Started Steps */}
        <Box sx={{ mb: 10, pt: 4 }}>
          <Slide in={isVisible} direction="up" timeout={1400}>
            <Box sx={{ textAlign: 'center', mb: 8 }}>
              <Typography variant="h3" component="h2" sx={{ fontWeight: 700, mb: 2 }}>
                Getting Started in 3 Steps
              </Typography>
              <Box sx={{
                width: 80,
                height: 4,
                background: `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.primary.main})`,
                mx: 'auto',
                borderRadius: 2
              }} />
            </Box>
          </Slide>

          <Box sx={{ pt: 3, overflow: 'visible' }}>
            <Grid container spacing={4}>
              {steps.map((step, index) => (
                <Grid item xs={12} md={4} key={step.step}>
                  <Zoom in={isVisible} timeout={1600 + (index * 200)}>
                    <Box sx={{ position: 'relative', mt: 3 }}>
                      <Card
                        sx={{
                          height: '100%',
                          position: 'relative',
                          transition: 'all 0.3s ease-in-out',
                          overflow: 'visible',
                          '&:hover': {
                            transform: 'translateY(-8px)',
                            boxShadow: theme.shadows[12]
                          }
                        }}
                      >
                        <Box
                          sx={{
                            position: 'absolute',
                            top: -20,
                            left: 24,
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            backgroundColor: step.color,
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '1.2rem',
                            boxShadow: theme.shadows[4],
                            zIndex: 10
                          }}
                        >
                          {step.step}
                        </Box>

                        <CardContent sx={{ p: 4, pt: 6 }}>
                          <Typography variant="h6" component="h3" sx={{ fontWeight: 700, mb: 2 }}>
                            {step.title}
                          </Typography>

                          <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                            {step.description}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Box>
                  </Zoom>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Box>

        {/* Quick Actions */}
        <Fade in={isVisible} timeout={2000}>
          <Paper
            elevation={8}
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.grey[900]}, ${theme.palette.grey[800]})`,
              color: 'white',
              p: 8,
              borderRadius: 4,
              textAlign: 'center'
            }}
          >
            <Typography variant="h4" component="h3" sx={{ fontWeight: 700, mb: 2 }}>
              Ready to Get Started?
            </Typography>

            <Typography variant="h6" sx={{ color: theme.palette.grey[300], mb: 6, maxWidth: '600px', mx: 'auto' }}>
              Choose your next action and begin your journey with MicroDataCenter
            </Typography>

            <Grid container spacing={3} sx={{ maxWidth: '800px', mx: 'auto' }}>
              {actions.map((action, index) => (
                <Grid item xs={12} sm={6} lg={3} key={action.text}>
                  <Button
                    component={Link}
                    href={action.href}
                    variant="contained"
                    color={action.color as any}
                    size="large"
                    startIcon={action.icon}
                    fullWidth
                    sx={{
                      py: 2,
                      minHeight: 56,
                      borderRadius: 2,
                      fontWeight: 600,
                      transition: 'all 0.3s ease-in-out',
                      whiteSpace: 'nowrap',
                      '&:hover': {
                        transform: 'translateY(-4px) scale(1.02)',
                        boxShadow: theme.shadows[12]
                      }
                    }}
                  >
                    {action.text}
                  </Button>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Fade>
      </Container>
    </Box>
  )
}