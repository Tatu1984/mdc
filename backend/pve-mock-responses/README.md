# PVE Mock Responses

This directory contains JSON files that define the responses for the Mock Proxmox VE API server.

## Directory Structure

```
pve-mock-responses/
├── README.md                          # This file
├── root.json                          # Response for GET /
├── health.json                        # Response for GET /health
└── api2/json/                         # Proxmox API v2 responses
    ├── access/
    │   └── ticket.json                # POST /api2/json/access/ticket
    ├── nodes/
    │   ├── index.json                 # GET /api2/json/nodes
    │   ├── pve-node1/qemu/
    │   │   └── index.json             # GET /api2/json/nodes/pve-node1/qemu
    │   └── pve-node2/qemu/
    │       └── index.json             # GET /api2/json/nodes/pve-node2/qemu
    ├── cluster/
    │   └── resources.json             # GET /api2/json/cluster/resources
    └── version/
        └── index.json                 # GET /api2/json/version
```

## How to Customize

1. **Edit existing responses**: Modify any `.json` file to change the API response
2. **Add new endpoints**: Create new `.json` files following the URL path structure
3. **No restart required**: Changes are loaded dynamically by the mock server

## Examples

### Adding a new VM to node1:
Edit `api2/json/nodes/pve-node1/qemu/index.json` and add to the data array:
```json
{
  "vmid": 102,
  "name": "new-vm",
  "status": "running",
  "maxmem": 4294967296,
  "cpu": 0.25,
  "mem": 2147483648
}
```

### Adding a new node:
1. Create `api2/json/nodes/pve-node3/qemu/index.json`
2. Add the node to `api2/json/nodes/index.json`
3. Add the node to `api2/json/cluster/resources.json`

### Custom endpoint:
Create `api2/json/custom/endpoint.json` to respond to `GET /api2/json/custom/endpoint`

## Fallback Behavior

If a JSON file is missing, the mock server will:
1. Try to find an `index.json` file in the corresponding directory
2. Use built-in fallback responses for core endpoints
3. Return a 404 error for unmapped endpoints

## Testing Changes

After editing files, test your changes:
```bash
curl http://localhost:8001/api2/json/nodes
curl http://localhost:8001/api2/json/nodes/pve-node1/qemu
```