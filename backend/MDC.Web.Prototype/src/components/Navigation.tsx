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
  Menu,
  MenuItem,
  Avatar,
  Tooltip,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  useMediaQuery,
  useTheme,
  Divider,
  ListItemAvatar
} from '@mui/material'
import {
  Menu as MenuIcon,
  Dashboard,
  Folder,
  DataUsage,
  GetApp,
  Person,
  Close,
  Description,
  Business,
  Logout,
  Login
} from '@mui/icons-material'
import { useAuth } from '@/contexts/AuthContext'

const navigationItems = [
  { title: 'Dashboard', href: '/', icon: Dashboard },
  { title: 'Get Started', href: '/get-started', icon: GetApp },
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
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null)
  const { isAuthenticated, username, userInfo, login, logout } = useAuth()

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget)
  }

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null)
  }

  const drawer = (
    <Box sx={{ width: 250, pt: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2, pb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
          MicroDataCenter
        </Typography>
        <IconButton onClick={handleDrawerToggle}>
          <Close />
        </IconButton>
      </Box>
      <List>
        {navigationItems.map((item) => {
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
            MicroDataCenter
          </Typography>

          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 1, flexGrow: 1 }}>
              {navigationItems.map((item) => (
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

          <Box sx={{ flexGrow: isMobile ? 1 : 0 }} />

          {isAuthenticated ? (
            <Tooltip title="User Profile">
              <IconButton onClick={handleUserMenuOpen} sx={{ ml: 2 }}>
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                  {username ? username.charAt(0).toUpperCase() : <Person />}
                </Avatar>
              </IconButton>
            </Tooltip>
          ) : (
            <Button
              variant="outlined"
              startIcon={<Login />}
              onClick={login}
              sx={{ ml: 2 }}
            >
              Sign In
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Menu
        anchorEl={userMenuAnchor}
        open={Boolean(userMenuAnchor)}
        onClose={handleUserMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, py: 1.5, minWidth: 200 }}>
          <Typography variant="subtitle2" fontWeight="bold">
            {userInfo?.firstName && userInfo?.lastName
              ? `${userInfo.firstName} ${userInfo.lastName}`
              : username || 'User'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {userInfo?.email || ''}
          </Typography>
          {userInfo?.roles && userInfo.roles.length > 0 && (
            <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
              Role: {userInfo.roles[0]}
            </Typography>
          )}
        </Box>
        <Divider />
        <MenuItem
          component={Link}
          href="/user"
          onClick={handleUserMenuClose}
        >
          <Person sx={{ mr: 1 }} /> Profile
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleUserMenuClose()
            logout()
          }}
        >
          <Logout sx={{ mr: 1 }} /> Logout
        </MenuItem>
      </Menu>

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