'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  useMediaQuery,
  useTheme,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  CircularProgress
} from '@mui/material'
import {
  Menu as MenuIcon,
  Dashboard,
  Folder,
  DataUsage,
  Person,
  Close,
  Description,
  Business,
  Login,
  Logout,
  GetApp
} from '@mui/icons-material'
import { useAuth } from '@/hooks/useAuth'

// Navigation items shown only when authenticated
const authenticatedNavItems = [
  { title: 'Get Started', href: '/get-started', icon: GetApp },
  { title: 'Dashboard', href: '/', icon: Dashboard },
  { title: 'Projects', href: '/projects', icon: Business },
  { title: 'Workspaces', href: '/workspace', icon: Folder },
  { title: 'Runbooks', href: '/runbooks', icon: Description },
  { title: 'Data Center', href: '/data-center', icon: DataUsage },
]

export default function Navigation() {
  const pathname = usePathname()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [mobileOpen, setMobileOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const { isAuthenticated, isLoading, user, loginPopup, logoutPopup } = useAuth()

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleUserMenuClose = () => {
    setAnchorEl(null)
  }

  const handleLogin = async () => {
    try {
      await loginPopup()
    } catch (error) {
      console.error('Login failed:', error)
    }
  }

  const handleLogout = async () => {
    handleUserMenuClose()
    try {
      await logoutPopup()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const drawer = (
    <Box sx={{ width: 250, pt: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2, pb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
          MicroDataCluster
        </Typography>
        <IconButton onClick={handleDrawerToggle}>
          <Close />
        </IconButton>
      </Box>
      <List>
        {isAuthenticated && authenticatedNavItems.map((item) => {
          const Icon = item.icon
          return (
            <ListItem key={item.title} disablePadding>
              <ListItemButton
                component={Link}
                href={item.href}
                selected={pathname === item.href}
                onClick={handleDrawerToggle}
              >
                <ListItemIcon>
                  <Icon color={pathname === item.href ? 'primary' : 'inherit'} />
                </ListItemIcon>
                <ListItemText primary={item.title} />
              </ListItemButton>
            </ListItem>
          )
        })}
      </List>
    </Box>
  )

  return (
    <>
      <AppBar position="sticky" elevation={1}>
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          <Typography
            variant="h6"
            component={Link}
            href="/"
            sx={{
              fontWeight: 700,
              color: 'primary.main',
              textDecoration: 'none',
              mr: 4
            }}
          >
            MicroDataCluster
          </Typography>

          {!isMobile && isAuthenticated && (
            <Box sx={{ display: 'flex', gap: 1, flexGrow: 1 }}>
              {authenticatedNavItems.map((item) => (
                <Button
                  key={item.title}
                  component={Link}
                  href={item.href}
                  color={pathname === item.href ? 'primary' : 'inherit'}
                  variant={pathname === item.href ? 'contained' : 'text'}
                  startIcon={<item.icon />}
                  sx={{ mr: 1 }}
                >
                  {item.title}
                </Button>
              ))}
            </Box>
          )}

          <Box sx={{ flexGrow: (isMobile || !isAuthenticated) ? 1 : 0 }} />

          {isLoading ? (
            <CircularProgress size={24} color="inherit" />
          ) : isAuthenticated ? (
            <>
              <IconButton
                onClick={handleUserMenuOpen}
                size="small"
                sx={{ ml: 2 }}
                aria-controls={anchorEl ? 'account-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={anchorEl ? 'true' : undefined}
              >
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                  {user?.name?.charAt(0)?.toUpperCase() || <Person />}
                </Avatar>
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                id="account-menu"
                open={Boolean(anchorEl)}
                onClose={handleUserMenuClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <MenuItem disabled>
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      {user?.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {user?.email}
                    </Typography>
                  </Box>
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <Logout fontSize="small" />
                  </ListItemIcon>
                  Sign Out
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Button
              color="inherit"
              onClick={handleLogin}
              startIcon={<Login />}
            >
              Sign In
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 250 },
        }}
      >
        {drawer}
      </Drawer>
    </>
  )
}