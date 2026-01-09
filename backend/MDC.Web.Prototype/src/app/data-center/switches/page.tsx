"use client";

import { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  Chip,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  Tooltip,
  TablePagination,
  TableSortLabel,
  Menu,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  Router,
  Search,
  Settings,
  Cable,
  Visibility,
  Edit,
  Delete,
  CheckCircle,
  Cancel,
  Circle,
  Computer,
  Memory,
  Videocam,
  Sensors,
  DeviceHub,
  MoreVert,
  Add,
  Clear,
} from "@mui/icons-material";

interface WorkstationPort {
  portName: string; // 'Slot1Port2', 'iDRAC', 'MBC', etc.
  status: "connected" | "disconnected" | "disabled";
  switchName?: string;
  switchPort?: string;
  vlan?: number;
  speed?: string;
  duplex?: "full" | "half";
  macAddress?: string;
  ipAddress?: string;
  lastActivity?: string;
}

interface WorkstationConfig {
  id: string;
  type: string; // 'Dell XR12', 'Dell XR800', etc.
  serial: string;
  assignedWorkspace?: string;
  ports: WorkstationPort[];
}

interface SwitchPort {
  id: string;
  portNumber: string;
  portName: string;
  status: "connected" | "disconnected" | "disabled";
  connectedWorkstation?: {
    type: string;
    serial: string;
    portName: string; // Which port on the workstation
    workspace?: string;
  };
  vlan?: number;
  speed?: string;
  duplex?: "full" | "half";
  lastActivity?: string;
  macAddress?: string;
  ipAddress?: string;
}

interface NetworkSwitch {
  id: string;
  name: string;
  model: string;
  manufacturer: string;
  location: string;
  managementIP: string;
  status: "online" | "offline" | "maintenance";
  uptime: string;
  firmware: string;
  totalPorts: number;
  usedPorts: number;
  ports: SwitchPort[];
}

export default function SwitchesPage() {
  // Workstation configurations showing port arrays
  const [workstationConfigs] = useState<WorkstationConfig[]>([
    {
      id: "ws-001",
      type: "Dell XR12",
      serial: "DXR12-7F8G9H0",
      assignedWorkspace: "AI Research Project",
      ports: [
        {
          portName: "Slot1Port1",
          status: "disconnected",
        },
        {
          portName: "Slot1Port2",
          status: "connected",
          switchName: "SW-CORE-01",
          switchPort: "Gi1/0/1",
          vlan: 100,
          speed: "1000",
          duplex: "full",
          macAddress: "00:14:22:01:23:45",
          ipAddress: "10.0.1.15",
          lastActivity: "2024-01-20T14:30:00Z",
        },
        {
          portName: "iDRAC",
          status: "connected",
          switchName: "SW-CORE-02",
          switchPort: "Gi2/0/40",
          vlan: 200,
          speed: "1000",
          duplex: "full",
          macAddress: "00:14:22:01:23:46",
          ipAddress: "10.0.200.15",
          lastActivity: "2024-01-20T14:29:00Z",
        },
        {
          portName: "MBC",
          status: "disconnected",
        },
      ],
    },
    {
      id: "ws-002",
      type: "Dell XR800",
      serial: "DXR800-9K2L3M4",
      assignedWorkspace: "Web Development",
      ports: [
        {
          portName: "Slot1Port1",
          status: "connected",
          switchName: "SW-CORE-02",
          switchPort: "Gi2/0/1",
          vlan: 300,
          speed: "1000",
          duplex: "full",
          macAddress: "00:14:22:02:34:58",
          ipAddress: "10.0.3.20",
          lastActivity: "2024-01-20T14:23:00Z",
        },
        {
          portName: "Slot1Port2",
          status: "disconnected",
        },
        {
          portName: "Slot2Port1",
          status: "connected",
          switchName: "SW-CORE-01",
          switchPort: "Gi1/0/6",
          vlan: 100,
          speed: "1000",
          duplex: "full",
          macAddress: "00:14:22:02:34:57",
          ipAddress: "10.0.1.21",
          lastActivity: "2024-01-20T14:24:00Z",
        },
        {
          portName: "Slot2Port2",
          status: "disconnected",
        },
        {
          portName: "iDRAC",
          status: "connected",
          switchName: "SW-CORE-02",
          switchPort: "Gi2/0/2",
          vlan: 200,
          speed: "1000",
          duplex: "full",
          macAddress: "00:14:22:02:34:59",
          ipAddress: "10.0.200.20",
          lastActivity: "2024-01-20T14:22:00Z",
        },
        {
          portName: "MBC",
          status: "connected",
          switchName: "SW-CORE-01",
          switchPort: "Gi1/0/5",
          vlan: 100,
          speed: "1000",
          duplex: "full",
          macAddress: "00:14:22:02:34:56",
          ipAddress: "10.0.1.20",
          lastActivity: "2024-01-20T14:25:00Z",
        },
      ],
    },
    {
      id: "ws-003",
      type: "IP Camera",
      serial: "CAM-4K-A1B2C3D4",
      assignedWorkspace: "Palet Defect Detection",
      ports: [
        {
          portName: "Ethernet",
          status: "connected",
          switchName: "SW-PROD-01",
          switchPort: "Gi3/0/15",
          vlan: 400,
          speed: "100",
          duplex: "full",
          macAddress: "64:32:A8:78:90:12",
          ipAddress: "10.0.3.45",
          lastActivity: "2024-01-20T14:28:00Z",
        },
        {
          portName: "Power",
          status: "connected",
          switchName: "SW-PROD-01",
          switchPort: "PoE-15",
        },
      ],
    },
  ]);

  const [switches] = useState<NetworkSwitch[]>([
    {
      id: "sw-core-01",
      name: "SW-CORE-01",
      model: "Catalyst 9300-48P",
      manufacturer: "Cisco Systems",
      location: "Main Data Center - Rack A1",
      managementIP: "10.0.0.10",
      status: "online",
      uptime: "45 days, 12:34:56",
      firmware: "16.12.10",
      totalPorts: 48,
      usedPorts: 24,
      ports: [
        {
          id: "sw-core-01-p1",
          portNumber: "Gi1/0/1",
          portName: "Dell-XR12-Slot1Port2",
          status: "connected",
          connectedWorkstation: {
            type: "Dell XR12",
            serial: "DXR12-7F8G9H0",
            portName: "Slot1Port2",
            workspace: "AI Research Project",
          },
          vlan: 100,
          speed: "1000",
          duplex: "full",
          lastActivity: "2024-01-20T14:30:00Z",
          macAddress: "00:14:22:01:23:45",
          ipAddress: "10.0.1.15",
        },
        {
          id: "sw-core-01-p5",
          portNumber: "Gi1/0/5",
          portName: "Dell-XR800-MBC",
          status: "connected",
          connectedWorkstation: {
            type: "Dell XR800",
            serial: "DXR800-9K2L3M4",
            portName: "MBC",
            workspace: "Web Development",
          },
          vlan: 100,
          speed: "1000",
          duplex: "full",
          lastActivity: "2024-01-20T14:25:00Z",
          macAddress: "00:14:22:02:34:56",
          ipAddress: "10.0.1.20",
        },
        {
          id: "sw-core-01-p6",
          portNumber: "Gi1/0/6",
          portName: "Dell-XR800-Slot2Port1",
          status: "connected",
          connectedWorkstation: {
            type: "Dell XR800",
            serial: "DXR800-9K2L3M4",
            portName: "Slot2Port1",
            workspace: "Web Development",
          },
          vlan: 100,
          speed: "1000",
          duplex: "full",
          lastActivity: "2024-01-20T14:24:00Z",
          macAddress: "00:14:22:02:34:57",
          ipAddress: "10.0.1.21",
        },
        {
          id: "sw-core-01-p10",
          portNumber: "Gi1/0/10",
          portName: "Unassigned",
          status: "disconnected",
        },
        {
          id: "sw-core-01-p11",
          portNumber: "Gi1/0/11",
          portName: "Unassigned",
          status: "disconnected",
        },
      ],
    },
    {
      id: "sw-core-02",
      name: "SW-CORE-02",
      model: "Catalyst 9300-24P",
      manufacturer: "Cisco Systems",
      location: "Main Data Center - Rack A2",
      managementIP: "10.0.0.11",
      status: "online",
      uptime: "38 days, 08:15:22",
      firmware: "16.12.10",
      totalPorts: 24,
      usedPorts: 12,
      ports: [
        {
          id: "sw-core-02-p1",
          portNumber: "Gi2/0/1",
          portName: "Dell-XR800-Slot1Port1",
          status: "connected",
          connectedWorkstation: {
            type: "Dell XR800",
            serial: "DXR800-9K2L3M4",
            portName: "Slot1Port1",
            workspace: "Web Development",
          },
          vlan: 300,
          speed: "1000",
          duplex: "full",
          lastActivity: "2024-01-20T14:23:00Z",
          macAddress: "00:14:22:02:34:58",
          ipAddress: "10.0.3.20",
        },
        {
          id: "sw-core-02-p2",
          portNumber: "Gi2/0/2",
          portName: "Dell-XR800-iDRAC",
          status: "connected",
          connectedWorkstation: {
            type: "Dell XR800",
            serial: "DXR800-9K2L3M4",
            portName: "iDRAC",
            workspace: "Web Development",
          },
          vlan: 200,
          speed: "1000",
          duplex: "full",
          lastActivity: "2024-01-20T14:22:00Z",
          macAddress: "00:14:22:02:34:59",
          ipAddress: "10.0.200.20",
        },
        {
          id: "sw-core-02-p40",
          portNumber: "Gi2/0/40",
          portName: "Dell-XR12-iDRAC",
          status: "connected",
          connectedWorkstation: {
            type: "Dell XR12",
            serial: "DXR12-7F8G9H0",
            portName: "iDRAC",
            workspace: "AI Research Project",
          },
          vlan: 200,
          speed: "1000",
          duplex: "full",
          lastActivity: "2024-01-20T14:29:00Z",
          macAddress: "00:14:22:01:23:46",
          ipAddress: "10.0.200.15",
        },
      ],
    },
    {
      id: "sw-prod-01",
      name: "SW-PROD-01",
      model: "Catalyst 2960X-48FPD-L",
      manufacturer: "Cisco Systems",
      location: "Production Floor - Section A",
      managementIP: "10.0.0.20",
      status: "online",
      uptime: "123 days, 04:45:18",
      firmware: "15.2(7)E10",
      totalPorts: 48,
      usedPorts: 18,
      ports: [
        {
          id: "sw-prod-01-p15",
          portNumber: "Gi3/0/15",
          portName: "Camera-Ethernet",
          status: "connected",
          connectedWorkstation: {
            type: "IP Camera",
            serial: "CAM-4K-A1B2C3D4",
            portName: "Ethernet",
            workspace: "Palet Defect Detection",
          },
          vlan: 400,
          speed: "100",
          duplex: "full",
          lastActivity: "2024-01-20T14:28:00Z",
          macAddress: "64:32:A8:78:90:12",
          ipAddress: "10.0.3.45",
        },
      ],
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [switchFilter, setSwitchFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [workspaceFilter, setWorkspaceFilter] = useState("all");
  const [selectedPort, setSelectedPort] = useState<SwitchPort | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [configureOpen, setConfigureOpen] = useState(false);
  const [configuredPorts, setConfiguredPorts] = useState<
    Array<{
      id: string;
      portName: string;
      switchName: string;
      switchPort: string;
    }>
  >([]);
  const [editingPortId, setEditingPortId] = useState<string | null>(null);
  const [configWorkstationType, setConfigWorkstationType] = useState("");
  const [configWorkstationSerial, setConfigWorkstationSerial] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [orderBy, setOrderBy] = useState<keyof SwitchPort>("portNumber");
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [actionMenuAnchor, setActionMenuAnchor] = useState<null | HTMLElement>(
    null,
  );
  const [selectedActionPort, setSelectedActionPort] =
    useState<SwitchPort | null>(null);

  // Flatten all ports from all switches for table display
  const allPorts = switches.flatMap((sw) =>
    sw.ports.map((port) => ({
      ...port,
      switchName: sw.name,
      switchLocation: sw.location,
      switchId: sw.id,
    })),
  );

  const getWorkstationTypeIcon = (type?: string) => {
    switch (type) {
      case "Dell XR12":
      case "Dell XR800":
        return <Computer sx={{ fontSize: "1.5rem" }} />;
      case "IP Camera":
        return <Videocam sx={{ fontSize: "1.5rem" }} />;
      case "Intel NUC":
        return <Memory sx={{ fontSize: "1.5rem" }} />;
      case "Temperature Sensor":
      case "Humidity Sensor":
        return <Sensors sx={{ fontSize: "1.5rem" }} />;
      default:
        return <DeviceHub sx={{ fontSize: "1.5rem" }} />;
    }
  };

  const getWorkstationTypeColor = (type?: string) => {
    switch (type) {
      case "Dell XR12":
      case "Dell XR800":
        return "#007DB8";
      case "IP Camera":
        return "#FF6B35";
      case "Intel NUC":
        return "#0071C5";
      case "Temperature Sensor":
        return "#FF5722";
      case "Humidity Sensor":
        return "#2196F3";
      default:
        return "#757575";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "connected":
        return "success";
      case "disconnected":
        return "warning";
      case "disabled":
        return "error";
      default:
        return "default";
    }
  };

  const getPortStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
        return <CheckCircle color="success" fontSize="small" />;
      case "disconnected":
        return <Cancel color="warning" fontSize="small" />;
      case "disabled":
        return <Circle color="error" fontSize="small" />;
      default:
        return <Circle color="disabled" fontSize="small" />;
    }
  };

  const getPortTypeChipColor = (portType?: string) => {
    switch (portType) {
      case "iDRAC":
        return "secondary";
      case "MBC":
        return "primary";
      case "PoE+":
        return "warning";
      default:
        return "default";
    }
  };

  const filteredPorts = allPorts.filter((port) => {
    const matchesSearch =
      port.portNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      port.portName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (port.connectedWorkstation?.type &&
        port.connectedWorkstation.type
          .toLowerCase()
          .includes(searchTerm.toLowerCase())) ||
      (port.connectedWorkstation?.serial &&
        port.connectedWorkstation.serial
          .toLowerCase()
          .includes(searchTerm.toLowerCase())) ||
      (port.connectedWorkstation?.workspace &&
        port.connectedWorkstation.workspace
          .toLowerCase()
          .includes(searchTerm.toLowerCase())) ||
      (port as any).switchName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSwitch =
      switchFilter === "all" || (port as any).switchName === switchFilter;
    const matchesStatus =
      statusFilter === "all" || port.status === statusFilter;
    const matchesWorkspace =
      workspaceFilter === "all" ||
      port.connectedWorkstation?.workspace === workspaceFilter;

    return matchesSearch && matchesSwitch && matchesStatus && matchesWorkspace;
  });

  const handleSort = (property: keyof SwitchPort) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const sortedPorts = [...filteredPorts].sort((a, b) => {
    const aValue = a[orderBy] || "";
    const bValue = b[orderBy] || "";

    if (order === "asc") {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  const paginatedPorts = sortedPorts.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  const handleViewDetails = (port: SwitchPort) => {
    setSelectedPort(port);
    setDetailsOpen(true);
  };

  const handleConfigurePort = (port: SwitchPort) => {
    setSelectedPort(port);
    // Initialize with existing connected workstation ports if any
    if (port.connectedWorkstation) {
      const workstation = workstationConfigs.find(
        (w) => w.serial === port.connectedWorkstation!.serial,
      );
      if (workstation) {
        setConfigWorkstationType(workstation.type);
        setConfigWorkstationSerial(workstation.serial);
        const portMappings = workstation.ports
          .filter((p) => p.switchName && p.switchPort)
          .map((p) => ({
            id: `${workstation.serial}-${p.portName}`,
            portName: p.portName,
            switchName: p.switchName!,
            switchPort: p.switchPort!,
          }));
        setConfiguredPorts(portMappings);
      } else {
        setConfigWorkstationType(port.connectedWorkstation.type);
        setConfigWorkstationSerial(port.connectedWorkstation.serial);
      }
    } else {
      setConfigWorkstationType("");
      setConfigWorkstationSerial("");
      setConfiguredPorts([]);
    }
    setConfigureOpen(true);
  };

  const handleAddPort = () => {
    const newPort = {
      id: `port-${Date.now()}`,
      portName: "",
      switchName: "",
      switchPort: "",
    };
    setConfiguredPorts([...configuredPorts, newPort]);
    setEditingPortId(newPort.id);
  };

  const handleUpdatePort = (id: string, field: string, value: string) => {
    setConfiguredPorts((ports) =>
      ports.map((port) =>
        port.id === id ? { ...port, [field]: value } : port,
      ),
    );
  };

  const handleDeletePort = (id: string) => {
    setConfiguredPorts((ports) => ports.filter((port) => port.id !== id));
    if (editingPortId === id) {
      setEditingPortId(null);
    }
  };

  const handleSaveConfiguration = () => {
    // Here you would save the configuration to your backend
    console.log("Saving port configuration:", {
      workstationType: configWorkstationType,
      workstationSerial: configWorkstationSerial,
      ports: configuredPorts,
    });
    setConfigureOpen(false);
    setConfiguredPorts([]);
    setEditingPortId(null);
    setConfigWorkstationType("");
    setConfigWorkstationSerial("");
  };

  const handleActionMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    port: SwitchPort,
  ) => {
    setActionMenuAnchor(event.currentTarget);
    setSelectedActionPort(port);
  };

  const handleActionMenuClose = () => {
    setActionMenuAnchor(null);
    setSelectedActionPort(null);
  };

  const handleRemoveConfiguration = () => {
    // Implement remove configuration logic
    handleActionMenuClose();
  };

  // Get unique values for filters
  const uniqueSwitches = Array.from(new Set(switches.map((sw) => sw.name)));
  const uniqueWorkspaces = Array.from(
    new Set(
      allPorts
        .filter((p) => p.connectedWorkstation?.workspace)
        .map((p) => p.connectedWorkstation!.workspace!),
    ),
  );

  // Get available switch ports for dropdown
  const getAvailableSwitchPorts = (switchName: string) => {
    const selectedSwitch = switches.find((sw) => sw.name === switchName);
    return selectedSwitch ? selectedSwitch.ports.map((p) => p.portNumber) : [];
  };

  const stats = {
    totalPorts: allPorts.length,
    connectedPorts: allPorts.filter((p) => p.status === "connected").length,
    assignedPorts: allPorts.filter((p) => p.connectedWorkstation?.workspace)
      .length,
    totalSwitches: switches.length,
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <Router sx={{ color: "info.main", fontSize: "3rem" }} />
          <Box>
            <Typography variant="h3" component="h1" fontWeight="bold">
              Network Switches
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Manage switch ports and workstation connections
            </Typography>
          </Box>
        </Box>

        {/* Statistics */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              elevation={1}
              sx={{ p: 2, textAlign: "center", bgcolor: "info.50" }}
            >
              <Typography variant="h4" fontWeight="bold" color="info.main">
                {stats.totalSwitches}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Switches
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              elevation={1}
              sx={{ p: 2, textAlign: "center", bgcolor: "primary.50" }}
            >
              <Typography variant="h4" fontWeight="bold" color="primary.main">
                {stats.totalPorts}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Ports
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              elevation={1}
              sx={{ p: 2, textAlign: "center", bgcolor: "success.50" }}
            >
              <Typography variant="h4" fontWeight="bold" color="success.main">
                {stats.connectedPorts}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Connected Ports
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              elevation={1}
              sx={{ p: 2, textAlign: "center", bgcolor: "secondary.50" }}
            >
              <Typography variant="h4" fontWeight="bold" color="secondary.main">
                {stats.assignedPorts}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Assigned to Workspaces
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Search and Filters */}
      <Card elevation={2} sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                placeholder="Search ports, workstations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                  endAdornment: searchTerm && (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => setSearchTerm("")}
                      >
                        <Clear />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Switch</InputLabel>
                <Select
                  value={switchFilter}
                  label="Switch"
                  onChange={(e) => setSwitchFilter(e.target.value)}
                >
                  <MenuItem value="all">All Switches</MenuItem>
                  {uniqueSwitches.map((sw) => (
                    <MenuItem key={sw} value={sw}>
                      {sw}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="connected">Connected</MenuItem>
                  <MenuItem value="disconnected">Disconnected</MenuItem>
                  <MenuItem value="disabled">Disabled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Workspace</InputLabel>
                <Select
                  value={workspaceFilter}
                  label="Workspace"
                  onChange={(e) => setWorkspaceFilter(e.target.value)}
                >
                  <MenuItem value="all">All Workspaces</MenuItem>
                  {uniqueWorkspaces.map((ws) => (
                    <MenuItem key={ws} value={ws}>
                      {ws}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  {filteredPorts.length} ports found
                </Typography>
                <Button
                  startIcon={<Add />}
                  variant="contained"
                  size="small"
                  onClick={() => {
                    setSelectedPort(null);
                    setConfigWorkstationType("");
                    setConfigWorkstationSerial("");
                    setConfiguredPorts([]);
                    setConfigureOpen(true);
                  }}
                >
                  Configure Port
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Ports Table */}
      <Card elevation={2}>
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "grey.50" }}>
                  <TableCell sx={{ fontWeight: "bold" }}>
                    <TableSortLabel
                      active={orderBy === "portNumber"}
                      direction={orderBy === "portNumber" ? order : "asc"}
                      onClick={() => handleSort("portNumber")}
                    >
                      Port
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Switch</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>
                    <TableSortLabel
                      active={orderBy === "status"}
                      direction={orderBy === "status" ? order : "asc"}
                      onClick={() => handleSort("status")}
                    >
                      Status
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Workstation</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Port Type</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Workspace</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedPorts.map((port) => (
                  <TableRow key={port.id} hover>
                    <TableCell>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        {getPortStatusIcon(port.status)}
                        <Typography
                          variant="body2"
                          fontWeight="medium"
                          fontFamily="monospace"
                        >
                          {port.portNumber}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {(port as any).switchName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {(port as any).switchLocation}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={port.status}
                        color={getStatusColor(port.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {port.connectedWorkstation ? (
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 2 }}
                        >
                          <Avatar
                            sx={{
                              bgcolor: getWorkstationTypeColor(
                                port.connectedWorkstation.type,
                              ),
                              width: 32,
                              height: 32,
                            }}
                          >
                            {getWorkstationTypeIcon(
                              port.connectedWorkstation.type,
                            )}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {port.connectedWorkstation.type}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              fontFamily="monospace"
                            >
                              {port.connectedWorkstation.serial}
                            </Typography>
                          </Box>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Unassigned
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {port.connectedWorkstation?.portName ? (
                        <Chip
                          label={port.connectedWorkstation.portName}
                          color={
                            getPortTypeChipColor(
                              port.connectedWorkstation.portName,
                            ) as any
                          }
                          size="small"
                          variant="outlined"
                        />
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          -
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {port.connectedWorkstation?.workspace ? (
                        <Typography variant="body2" fontWeight="medium">
                          {port.connectedWorkstation.workspace}
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Unassigned
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => handleViewDetails(port)}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Configure">
                          <IconButton
                            size="small"
                            onClick={() => handleConfigurePort(port)}
                            color="primary"
                          >
                            <Settings />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="More Actions">
                          <IconButton
                            size="small"
                            onClick={(e) => handleActionMenuOpen(e, port)}
                          >
                            <MoreVert />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[10, 25, 50, 100]}
            component="div"
            count={filteredPorts.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(_e, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
          />
        </CardContent>
      </Card>

      {/* Action Menu */}
      <Menu
        anchorEl={actionMenuAnchor}
        open={Boolean(actionMenuAnchor)}
        onClose={handleActionMenuClose}
      >
        <MenuItem
          onClick={() => {
            handleConfigurePort(selectedActionPort!);
            handleActionMenuClose();
          }}
        >
          <ListItemIcon>
            <Edit fontSize="small" />
          </ListItemIcon>
          <ListItemText>Configure</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={handleRemoveConfiguration}
          disabled={!selectedActionPort?.connectedWorkstation?.workspace}
        >
          <ListItemIcon>
            <Delete fontSize="small" />
          </ListItemIcon>
          <ListItemText>Remove Configuration</ListItemText>
        </MenuItem>
      </Menu>

      {/* Port Details Dialog */}
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Cable sx={{ color: "info.main" }} />
            <Box>
              <Typography variant="h6" fontWeight="bold">
                Port Details: {selectedPort?.portNumber}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedPort?.portName}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedPort && (
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper elevation={1} sx={{ p: 2 }}>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      gutterBottom
                    >
                      SWITCH PORT INFORMATION
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Switch:</strong>{" "}
                      {(selectedPort as any).switchName}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Port Number:</strong> {selectedPort.portNumber}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Port Name:</strong> {selectedPort.portName}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Status:</strong> {selectedPort.status}
                    </Typography>
                  </Paper>
                </Grid>

                {selectedPort.connectedWorkstation && (
                  <Grid item xs={12} md={6}>
                    <Paper elevation={1} sx={{ p: 2 }}>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        gutterBottom
                      >
                        CONNECTED WORKSTATION
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Type:</strong>{" "}
                        {selectedPort.connectedWorkstation.type}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Serial:</strong>{" "}
                        {selectedPort.connectedWorkstation.serial}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Workstation Port:</strong>{" "}
                        {selectedPort.connectedWorkstation.portName}
                      </Typography>
                      {selectedPort.connectedWorkstation.workspace && (
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>Workspace:</strong>{" "}
                          {selectedPort.connectedWorkstation.workspace}
                        </Typography>
                      )}
                    </Paper>
                  </Grid>
                )}

                {selectedPort.ipAddress && (
                  <Grid item xs={12}>
                    <Paper elevation={1} sx={{ p: 2 }}>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        gutterBottom
                      >
                        NETWORK INFORMATION
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={4}>
                          <Typography variant="body2">
                            <strong>IP Address:</strong>{" "}
                            {selectedPort.ipAddress}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <Typography variant="body2">
                            <strong>MAC Address:</strong>{" "}
                            {selectedPort.macAddress}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <Typography variant="body2">
                            <strong>VLAN:</strong>{" "}
                            {selectedPort.vlan || "Default"}
                          </Typography>
                        </Grid>
                        {selectedPort.speed && (
                          <>
                            <Grid item xs={12} sm={6}>
                              <Typography variant="body2">
                                <strong>Speed:</strong> {selectedPort.speed}Mbps
                              </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Typography variant="body2">
                                <strong>Duplex:</strong> {selectedPort.duplex}
                              </Typography>
                            </Grid>
                          </>
                        )}
                      </Grid>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>Close</Button>
          <Button
            variant="contained"
            onClick={() => {
              setDetailsOpen(false);
              setConfigureOpen(true);
            }}
          >
            Configure
          </Button>
        </DialogActions>
      </Dialog>

      {/* Configure Port Dialog */}
      <Dialog
        open={configureOpen}
        onClose={() => setConfigureOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box>
              <Typography variant="h6">Configure Workstation Ports</Typography>
              <Typography variant="body2" color="text.secondary">
                Map workstation ports to switch ports
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleAddPort}
              size="small"
            >
              Add Port
            </Button>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            {/* Workstation Information */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                Workstation Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Workstation Type</InputLabel>
                    <Select
                      value={configWorkstationType}
                      label="Workstation Type"
                      onChange={(e) => setConfigWorkstationType(e.target.value)}
                    >
                      <MenuItem value="Dell XR12">Dell XR12</MenuItem>
                      <MenuItem value="Dell XR800">Dell XR800</MenuItem>
                      <MenuItem value="HPE ProLiant">HPE ProLiant</MenuItem>
                      <MenuItem value="IP Camera">IP Camera</MenuItem>
                      <MenuItem value="Intel NUC">Intel NUC</MenuItem>
                      <MenuItem value="Temperature Sensor">
                        Temperature Sensor
                      </MenuItem>
                      <MenuItem value="Humidity Sensor">
                        Humidity Sensor
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Serial Number"
                    value={configWorkstationSerial}
                    onChange={(e) => setConfigWorkstationSerial(e.target.value)}
                    placeholder="e.g., DXR12-7F8G9H0"
                  />
                </Grid>
              </Grid>
            </Box>

            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
              Port Mappings
            </Typography>

            {configuredPorts.length === 0 ? (
              <Paper sx={{ p: 4, textAlign: "center", bgcolor: "grey.50" }}>
                <Typography variant="body2" color="text.secondary">
                  No port mappings configured. Click "Add Port" to create a
                  mapping.
                </Typography>
              </Paper>
            ) : (
              <TableContainer component={Paper} elevation={1}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: "grey.50" }}>
                      <TableCell sx={{ fontWeight: "bold" }}>
                        Workstation Port
                      </TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Switch</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>
                        Switch Port
                      </TableCell>
                      <TableCell sx={{ fontWeight: "bold", width: 120 }}>
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {configuredPorts.map((port) => (
                      <TableRow key={port.id} hover>
                        <TableCell>
                          {editingPortId === port.id ? (
                            <TextField
                              fullWidth
                              size="small"
                              value={port.portName}
                              onChange={(e) =>
                                handleUpdatePort(
                                  port.id,
                                  "portName",
                                  e.target.value,
                                )
                              }
                              placeholder="e.g., Slot1Port2, iDRAC, MBC"
                            />
                          ) : (
                            <Typography variant="body2" fontWeight="medium">
                              {port.portName || "Not set"}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          {editingPortId === port.id ? (
                            <FormControl fullWidth size="small">
                              <Select
                                value={port.switchName}
                                onChange={(e) =>
                                  handleUpdatePort(
                                    port.id,
                                    "switchName",
                                    e.target.value,
                                  )
                                }
                                displayEmpty
                              >
                                <MenuItem value="">Select Switch</MenuItem>
                                {uniqueSwitches.map((sw) => (
                                  <MenuItem key={sw} value={sw}>
                                    {sw}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          ) : (
                            <Typography variant="body2">
                              {port.switchName || "Not set"}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          {editingPortId === port.id ? (
                            <FormControl fullWidth size="small">
                              <Select
                                value={port.switchPort}
                                onChange={(e) =>
                                  handleUpdatePort(
                                    port.id,
                                    "switchPort",
                                    e.target.value,
                                  )
                                }
                                displayEmpty
                              >
                                <MenuItem value="">Select Port</MenuItem>
                                {getAvailableSwitchPorts(port.switchName).map(
                                  (portNum) => (
                                    <MenuItem key={portNum} value={portNum}>
                                      {portNum}
                                    </MenuItem>
                                  ),
                                )}
                              </Select>
                            </FormControl>
                          ) : (
                            <Typography variant="body2" fontFamily="monospace">
                              {port.switchPort || "Not set"}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: "flex", gap: 1 }}>
                            {editingPortId === port.id ? (
                              <>
                                <Tooltip title="Save">
                                  <IconButton
                                    size="small"
                                    onClick={() => setEditingPortId(null)}
                                    color="primary"
                                  >
                                    <CheckCircle />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Cancel">
                                  <IconButton
                                    size="small"
                                    onClick={() => setEditingPortId(null)}
                                  >
                                    <Cancel />
                                  </IconButton>
                                </Tooltip>
                              </>
                            ) : (
                              <>
                                <Tooltip title="Edit">
                                  <IconButton
                                    size="small"
                                    onClick={() => setEditingPortId(port.id)}
                                  >
                                    <Edit />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleDeletePort(port.id)}
                                    color="error"
                                  >
                                    <Delete />
                                  </IconButton>
                                </Tooltip>
                              </>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setConfigureOpen(false);
              setConfiguredPorts([]);
              setEditingPortId(null);
              setConfigWorkstationType("");
              setConfigWorkstationSerial("");
            }}
          >
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSaveConfiguration}>
            Save Configuration
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

