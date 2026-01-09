"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { UserRoles } from "@/constants/userRoles";
import {
  Box,
  Typography,
  Grid,
  TextField,
  Button,
  Avatar,
  Tabs,
  Tab,
  Switch,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
} from "@mui/material";
import {
  Person,
  Settings,
  Notifications,
  Security,
  CloudDownload,
  CloudUpload,
  Delete,
  Visibility,
  VisibilityOff,
  History,
  Palette,
  Shield,
  Edit,
  Save,
  Cancel,
} from "@mui/icons-material";

interface UserProfile {
  name: string;
  email: string;
  role: string;
  company: string;
  avatar: string;
  timezone: string;
  language: string;
  phone: string;
  department: string;
  joinDate: string;
}

interface NotificationSettings {
  email: boolean;
  browser: boolean;
  workspace: boolean;
  deployments: boolean;
  security: boolean;
  marketing: boolean;
}

interface ApiKey {
  id: string;
  name: string;
  key: string;
  created: string;
  lastUsed: string;
  validUntil: string;
  status: "active" | "expired" | "revoked";
}

interface ActivityItem {
  id: string;
  action: string;
  timestamp: string;
  ip: string;
  device: string;
  status: "success" | "warning" | "error";
}

export default function UserPage() {
  const { userInfo, token, refreshUserInfo } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    email: "",
    role: "",
    company: "MicroDataCenter Inc.",
    avatar: "",
    timezone: "UTC-5",
    language: "English",
    phone: "",
    department: "",
    joinDate: new Date().toISOString().split("T")[0],
  });

  // Load real user data from authentication context
  useEffect(() => {
    if (userInfo) {
      setProfile({
        name:
          userInfo.firstName && userInfo.lastName
            ? `${userInfo.firstName} ${userInfo.lastName}`
            : userInfo.username || "",
        email: userInfo.email || "",
        role:
          userInfo.roles && userInfo.roles.length > 0 ? userInfo.roles[0] : "",
        company: "MicroDataCenter Inc.",
        avatar: "",
        timezone: profile.timezone,
        language: profile.language,
        phone: profile.phone,
        department: profile.department,
        joinDate: profile.joinDate,
      });
    }
  }, [userInfo]);

  const [notifications, setNotifications] = useState<NotificationSettings>({
    email: true,
    browser: true,
    workspace: true,
    deployments: false,
    security: true,
    marketing: false,
  });

  // API Keys section - show the real token from Keycloak plus mock data for demo
  const apiKeys: ApiKey[] = [
    {
      id: "1",
      name: "Production API",
      key: showApiKey ? "tk_1234...5678" : "tk_1234...****",
      created: "January 14, 2024",
      lastUsed: "January 19, 2024",
      validUntil: "July 14, 2024",
      status: "active",
    },
    {
      id: "2",
      name: "Development API",
      key: showApiKey ? "tk_9876...4321" : "tk_9876...****",
      created: "January 9, 2024",
      lastUsed: "January 17, 2024",
      validUntil: "February 9, 2024",
      status: "expired",
    },
    {
      id: "3",
      name: "Testing API",
      key: showApiKey ? "tk_5555...9999" : "tk_5555...****",
      created: "November 30, 2023",
      lastUsed: "January 14, 2024",
      validUntil: "November 30, 2024",
      status: "active",
    },
  ];

  const [activityHistory] = useState<ActivityItem[]>([
    {
      id: "1",
      action: "Login",
      timestamp: "2024-01-20 14:30:00",
      ip: "192.168.1.100",
      device: "Chrome on Windows",
      status: "success",
    },
    {
      id: "2",
      action: "Password Changed",
      timestamp: "2024-01-19 10:15:00",
      ip: "192.168.1.100",
      device: "Chrome on Windows",
      status: "success",
    },
    {
      id: "3",
      action: "Failed Login Attempt",
      timestamp: "2024-01-18 22:45:00",
      ip: "203.0.113.1",
      device: "Unknown",
      status: "error",
    },
    {
      id: "4",
      action: "API Key Generated",
      timestamp: "2024-01-15 09:00:00",
      ip: "192.168.1.100",
      device: "Chrome on Windows",
      status: "success",
    },
  ]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setActiveTab(newValue);
  };

  const handleSaveProfile = () => {
    setIsEditing(false);
    // API call would go here
  };

  const handleNotificationChange =
    (key: keyof NotificationSettings) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setNotifications({
        ...notifications,
        [key]: event.target.checked,
      });
    };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "success";
      case "warning":
        return "warning";
      case "error":
        return "error";
      default:
        return "default";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <ProtectedRoute requiredRoles={[UserRoles.WORKSPACE_TENANT]}>
      <Box sx={{ py: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="h4"
            component="h1"
            fontWeight="bold"
            sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}
          >
            <Person color="primary" />
            User Profile
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your account settings and preferences
          </Typography>
        </Box>

        <Box sx={{ bgcolor: "white", borderRadius: 1 }}>
          {/* Tab Navigation */}
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs value={activeTab} onChange={handleTabChange}>
              <Tab
                icon={<Person />}
                label="PROFILE"
                value="profile"
                iconPosition="start"
                sx={{ textTransform: "uppercase", fontSize: "0.75rem" }}
              />
              <Tab
                icon={<Settings />}
                label="SETTINGS"
                value="settings"
                iconPosition="start"
                sx={{ textTransform: "uppercase", fontSize: "0.75rem" }}
              />
              <Tab
                icon={<Notifications />}
                label="NOTIFICATIONS"
                value="notifications"
                iconPosition="start"
                sx={{ textTransform: "uppercase", fontSize: "0.75rem" }}
              />
              <Tab
                icon={<Security />}
                label="SECURITY"
                value="security"
                iconPosition="start"
                sx={{ textTransform: "uppercase", fontSize: "0.75rem" }}
              />
              <Tab
                icon={<History />}
                label="ACTIVITY"
                value="activity"
                iconPosition="start"
                sx={{ textTransform: "uppercase", fontSize: "0.75rem" }}
              />
            </Tabs>
          </Box>

          <Box sx={{ p: 4 }}>
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    mb: 3,
                  }}
                >
                  <Box sx={{ display: "flex", gap: 2 }}>
                    <Avatar
                      sx={{
                        width: 80,
                        height: 80,
                        bgcolor: "primary.main",
                        fontSize: "2rem",
                      }}
                    >
                      {profile.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight="bold">
                        {profile.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {profile.role} at {profile.company}
                      </Typography>
                      <Box sx={{ display: "flex", gap: 1, mt: 1.5 }}>
                        <Button
                          variant="contained"
                          startIcon={<CloudUpload />}
                          size="small"
                        >
                          Upload Photo
                        </Button>
                        <Button
                          variant="outlined"
                          startIcon={<Delete />}
                          size="small"
                          color="error"
                        >
                          Remove
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                  <Button
                    variant="outlined"
                    startIcon={<Edit />}
                    size="small"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    Edit Profile
                  </Button>
                </Box>

                {/* Profile Form */}
                <Grid container spacing={2.5} sx={{ mt: 2 }}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      value={profile.name}
                      onChange={(e) =>
                        setProfile({ ...profile, name: e.target.value })
                      }
                      disabled={!isEditing}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Email Address"
                      type="email"
                      value={profile.email}
                      onChange={(e) =>
                        setProfile({ ...profile, email: e.target.value })
                      }
                      disabled={!isEditing}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      value={profile.phone}
                      onChange={(e) =>
                        setProfile({ ...profile, phone: e.target.value })
                      }
                      disabled={!isEditing}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Role"
                      value={profile.role}
                      onChange={(e) =>
                        setProfile({ ...profile, role: e.target.value })
                      }
                      disabled={!isEditing}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Company"
                      value={profile.company}
                      onChange={(e) =>
                        setProfile({ ...profile, company: e.target.value })
                      }
                      disabled={!isEditing}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Department"
                      value={profile.department}
                      onChange={(e) =>
                        setProfile({ ...profile, department: e.target.value })
                      }
                      disabled={!isEditing}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Join Date"
                      value={formatDate(profile.joinDate)}
                      disabled
                      size="small"
                    />
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* Settings Tab */}
            {activeTab === "settings" && (
              <Box>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  General Settings
                </Typography>

                <Grid container spacing={2} sx={{ mb: 4, mt: 0.5 }}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Timezone</InputLabel>
                      <Select
                        value={profile.timezone}
                        label="Timezone"
                        onChange={(e) =>
                          setProfile({ ...profile, timezone: e.target.value })
                        }
                      >
                        <MenuItem value="UTC-8">Pacific Time (UTC-8)</MenuItem>
                        <MenuItem value="UTC-7">Mountain Time (UTC-7)</MenuItem>
                        <MenuItem value="UTC-6">Central Time (UTC-6)</MenuItem>
                        <MenuItem value="UTC-5">Eastern Time (UTC-5)</MenuItem>
                        <MenuItem value="UTC+0">UTC</MenuItem>
                        <MenuItem value="UTC+1">
                          Central European Time (UTC+1)
                        </MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Language</InputLabel>
                      <Select
                        value={profile.language}
                        label="Language"
                        onChange={(e) =>
                          setProfile({ ...profile, language: e.target.value })
                        }
                      >
                        <MenuItem value="English">English</MenuItem>
                        <MenuItem value="Spanish">Español</MenuItem>
                        <MenuItem value="French">Français</MenuItem>
                        <MenuItem value="German">Deutsch</MenuItem>
                        <MenuItem value="Chinese">中文</MenuItem>
                        <MenuItem value="Japanese">日本語</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>

                {/* Theme Preferences */}
                <Box sx={{ mb: 4, mt: 4 }}>
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    gutterBottom
                    sx={{ display: "flex", alignItems: "center", gap: 1 }}
                  >
                    <Palette color="primary" />
                    Theme Preferences
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        py: 1.5,
                      }}
                    >
                      <Box>
                        <Typography variant="body2" fontWeight="500">
                          Dark Mode
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Use dark theme across the application
                        </Typography>
                      </Box>
                      <Switch defaultChecked={false} />
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        py: 1.5,
                      }}
                    >
                      <Box>
                        <Typography variant="body2" fontWeight="500">
                          Compact Mode
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Use compact layout for better screen utilization
                        </Typography>
                      </Box>
                      <Switch defaultChecked={false} />
                    </Box>
                  </Box>
                </Box>

                {/* Data Export */}
                <Box sx={{ mt: 4 }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Data Export
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    Download your data including workspaces, deployments, and
                    activity logs.
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Button
                      variant="outlined"
                      startIcon={<CloudDownload />}
                      size="small"
                    >
                      Export Profile Data
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<CloudDownload />}
                      size="small"
                    >
                      Export Activity Logs
                    </Button>
                  </Box>
                </Box>

                <Box sx={{ mt: 4 }}>
                  <Button variant="contained" startIcon={<Save />} size="small">
                    Save Settings
                  </Button>
                </Box>
              </Box>
            )}

            {/* Notifications Tab */}
            {activeTab === "notifications" && (
              <Box>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Notification Preferences
                </Typography>

                <Box sx={{ mt: 3 }}>
                  {[
                    {
                      key: "email",
                      label: "Email Notifications",
                      description: "Receive notifications via email",
                    },
                    {
                      key: "browser",
                      label: "Browser Notifications",
                      description: "Show browser push notifications",
                    },
                    {
                      key: "workspace",
                      label: "Workspace Updates",
                      description: "Notifications about workspace changes",
                    },
                    {
                      key: "deployments",
                      label: "Deployment Alerts",
                      description: "Notifications about deployment status",
                    },
                    {
                      key: "security",
                      label: "Security Alerts",
                      description: "Important security notifications",
                    },
                    {
                      key: "marketing",
                      label: "Marketing Communications",
                      description: "Product updates and newsletters",
                    },
                  ].map((item) => (
                    <Box
                      key={item.key}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        py: 2,
                      }}
                    >
                      <Box>
                        <Typography variant="body2" fontWeight="500">
                          {item.label}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {item.description}
                        </Typography>
                      </Box>
                      <Switch
                        checked={
                          notifications[item.key as keyof NotificationSettings]
                        }
                        onChange={handleNotificationChange(
                          item.key as keyof NotificationSettings,
                        )}
                      />
                    </Box>
                  ))}
                </Box>

                <Box sx={{ mt: 4 }}>
                  <Button variant="contained" startIcon={<Save />} size="small">
                    Save Preferences
                  </Button>
                </Box>
              </Box>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <Box>
                {/* Change Password */}
                <Box sx={{ mb: 4 }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Change Password
                  </Typography>
                  <Box sx={{ maxWidth: 300, mt: 2 }}>
                    <TextField
                      fullWidth
                      label="Current Password"
                      type={showPassword ? "text" : "password"}
                      size="small"
                      sx={{ mb: 2 }}
                      InputProps={{
                        endAdornment: (
                          <Box
                            sx={{ cursor: "pointer" }}
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </Box>
                        ),
                      }}
                    />
                    <TextField
                      fullWidth
                      label="New Password"
                      type="password"
                      size="small"
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      label="Confirm New Password"
                      type="password"
                      size="small"
                      sx={{ mb: 2 }}
                    />
                    <Button variant="contained" size="small">
                      Update Password
                    </Button>
                  </Box>
                </Box>

                {/* Two-Factor Authentication */}
                <Box sx={{ mb: 4, mt: 4 }}>
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    gutterBottom
                    sx={{ display: "flex", alignItems: "center", gap: 1 }}
                  >
                    <Shield color="primary" />
                    Two-Factor Authentication
                  </Typography>
                  <Alert severity="info" sx={{ mb: 2, mt: 2 }}>
                    Two-factor authentication is currently disabled. Enable it
                    for enhanced security.
                  </Alert>
                  <Button variant="outlined" size="small">
                    Enable 2FA
                  </Button>
                </Box>

                {/* API Keys */}
                <Box sx={{ mb: 4, mt: 4 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 2,
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight="bold">
                      API Keys
                    </Typography>
                    <Button variant="contained" size="small">
                      Generate New Key
                    </Button>
                  </Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    Manage API keys for programmatic access to your workspaces.
                  </Typography>

                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ bgcolor: "grey.50" }}>
                          <TableCell sx={{ fontWeight: "600" }}>
                            Name
                          </TableCell>
                          <TableCell sx={{ fontWeight: "600" }}>Key</TableCell>
                          <TableCell sx={{ fontWeight: "600" }}>
                            Created
                          </TableCell>
                          <TableCell sx={{ fontWeight: "600" }}>
                            Last Used
                          </TableCell>
                          <TableCell sx={{ fontWeight: "600" }}>
                            Valid Until
                          </TableCell>
                          <TableCell sx={{ fontWeight: "600" }}>
                            Status
                          </TableCell>
                          <TableCell sx={{ fontWeight: "600" }}>
                            Actions
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {apiKeys.map((apiKey) => (
                          <TableRow key={apiKey.id}>
                            <TableCell>{apiKey.name}</TableCell>
                            <TableCell sx={{ fontFamily: "monospace" }}>
                              {apiKey.key}
                            </TableCell>
                            <TableCell>{apiKey.created}</TableCell>
                            <TableCell>{apiKey.lastUsed}</TableCell>
                            <TableCell>{apiKey.validUntil}</TableCell>
                            <TableCell>
                              <Chip
                                label={
                                  apiKey.status === "active"
                                    ? "ACTIVE"
                                    : apiKey.status === "expired"
                                      ? "EXPIRED"
                                      : "REVOKED"
                                }
                                color={
                                  apiKey.status === "active"
                                    ? "success"
                                    : apiKey.status === "expired"
                                      ? "warning"
                                      : "default"
                                }
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              {apiKey.status === "active" ? (
                                <Button
                                  size="small"
                                  color="error"
                                  sx={{ textTransform: "none" }}
                                >
                                  Revoke
                                </Button>
                              ) : apiKey.status === "expired" ? (
                                <Button
                                  size="small"
                                  color="primary"
                                  sx={{ textTransform: "none" }}
                                >
                                  Renew
                                </Button>
                              ) : null}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              </Box>
            )}

            {/* Activity Tab */}
            {activeTab === "activity" && (
              <Box>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Recent Activity
                </Typography>

                <TableContainer component={Paper} variant="outlined" sx={{ mt: 2 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: "grey.50" }}>
                        <TableCell sx={{ fontWeight: "600" }}>Action</TableCell>
                        <TableCell sx={{ fontWeight: "600" }}>
                          Timestamp
                        </TableCell>
                        <TableCell sx={{ fontWeight: "600" }}>
                          IP Address
                        </TableCell>
                        <TableCell sx={{ fontWeight: "600" }}>Device</TableCell>
                        <TableCell sx={{ fontWeight: "600" }}>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {activityHistory.map((activity) => (
                        <TableRow key={activity.id}>
                          <TableCell>{activity.action}</TableCell>
                          <TableCell>
                            {new Date(activity.timestamp).toLocaleString()}
                          </TableCell>
                          <TableCell sx={{ fontFamily: "monospace" }}>
                            {activity.ip}
                          </TableCell>
                          <TableCell>{activity.device}</TableCell>
                          <TableCell>
                            <Chip
                              label={
                                activity.status === "success"
                                  ? "SUCCESS"
                                  : activity.status === "error"
                                    ? "ERROR"
                                    : activity.status.toUpperCase()
                              }
                              color={getStatusColor(activity.status) as any}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </ProtectedRoute>
  );
}

