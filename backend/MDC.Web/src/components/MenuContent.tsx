import * as React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import WorkspacesIcon from '@mui/icons-material/Workspaces';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ScreenshotMonitorIcon from '@mui/icons-material/ScreenshotMonitor';
import MonitorIcon from '@mui/icons-material/Monitor';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import HelpRoundedIcon from '@mui/icons-material/HelpRounded';
import Link from 'next/link';
import { useRouter } from 'next/router';

const mainListItems = [
  { text: 'Home', icon: <HomeRoundedIcon />, link: '/' },
  { text: 'Datacenter', icon: <DashboardIcon />, link: '/datacenter' },
  { text: 'Nests', icon: <WorkspacesIcon /> },
  { text: 'VM Templates', icon: <ScreenshotMonitorIcon /> },
  { text: 'Workstations', icon: <MonitorIcon /> },
  { text: 'Workbooks', icon: <AssignmentRoundedIcon /> },
];

const secondaryListItems = [
  { text: 'Demo Page', icon: <InfoRoundedIcon />, link: '/datacenter-demo' },
  { text: 'Settings', icon: <SettingsRoundedIcon /> },
  { text: 'About', icon: <InfoRoundedIcon /> },
  { text: 'Feedback', icon: <HelpRoundedIcon /> },
];

export default function MenuContent() {
  const router = useRouter();

  return (
    <Stack sx={{ flexGrow: 1, p: 1, justifyContent: 'space-between' }}>
      <List dense>
        {mainListItems.map((item, index) => (
          <ListItem key={index} disablePadding sx={{ display: 'block' }}>
            {item.link ? (
              <Link href={item.link} passHref style={{ textDecoration: 'none', color: 'inherit' }}>
                <ListItemButton selected={router.pathname === item.link}>
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </Link>
            ) : (
              <ListItemButton>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            )}
          </ListItem>
        ))}
      </List>
      <List dense>
        {secondaryListItems.map((item, index) => (
          <ListItem key={index} disablePadding sx={{ display: 'block' }}>
            {item.link ? (
              <Link href={item.link} passHref style={{ textDecoration: 'none', color: 'inherit' }}>
                <ListItemButton selected={router.pathname === item.link}>
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </Link>
            ) : (
              <ListItemButton>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            )}
          </ListItem>
        ))}
      </List>
    </Stack>
  );
}
