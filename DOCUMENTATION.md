# MDC (MicroDataCenter) - Project Documentation

**Version:** 1.0.1
**Last Updated:** January 2025
**Status:** Active Development

---

## Table of Contents

1. [Overview](#1-overview)
2. [Architecture](#2-architecture)
3. [Project Structure](#3-project-structure)
4. [Backend Components](#4-backend-components)
5. [Frontend Components](#5-frontend-components)
6. [Authentication & Authorization](#6-authentication--authorization)
7. [Database](#7-database)
8. [Infrastructure & Deployment](#8-infrastructure--deployment)
9. [API Reference](#9-api-reference)
10. [Configuration](#10-configuration)
11. [Development Setup](#11-development-setup)
12. [Testing](#12-testing)
13. [Future Improvements](#13-future-improvements)

---

## 1. Overview

### 1.1 What is MDC?

MDC (MicroDataCenter) is a comprehensive infrastructure management platform designed to manage and orchestrate **Proxmox Virtual Environment (PVE)** datacenters. It provides a full-stack solution for:

- Managing virtual machines and templates
- Creating and managing workspaces
- Network configuration and switch management
- User authentication and role-based access control
- Infrastructure monitoring and orchestration

### 1.2 Technology Stack

| Layer | Technology |
|-------|------------|
| **Backend API** | .NET 9, ASP.NET Core, OData |
| **Frontend** | Next.js 14, React 18, TypeScript |
| **UI Components** | Radix UI, Tailwind CSS |
| **Authentication** | Keycloak (OAuth2/OIDC) |
| **Database** | PostgreSQL |
| **Containerization** | Docker, Docker Compose |
| **Orchestration** | Kubernetes (k3s), Helm |
| **CI/CD** | Azure DevOps Pipelines |
| **IaC** | Terraform |

### 1.3 Key Features

- **OData-compliant REST API** with full query capabilities
- **Multi-tenant workspace management** with isolated resources
- **Proxmox VE integration** for VM lifecycle management
- **Role-based access control** (4-tier hierarchy)
- **Real-time infrastructure monitoring**
- **Container-native deployment** with Kubernetes support

---

## 2. Architecture

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Next.js 14 Application                      │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │   │
│  │  │Dashboard │ │Workspace │ │Datacenter│ │ Projects │   │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS (JWT Bearer Token)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         BACKEND                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                   MDC.Api (.NET 9)                       │   │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐    │   │
│  │  │ OData        │ │ Controllers  │ │ Auth         │    │   │
│  │  │ Endpoints    │ │              │ │ Middleware   │    │   │
│  │  └──────────────┘ └──────────────┘ └──────────────┘    │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                   MDC.Core                               │   │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐    │   │
│  │  │ Datacenter   │ │ Workspace    │ │ Device       │    │   │
│  │  │ Service      │ │ Service      │ │ Service      │    │   │
│  │  └──────────────┘ └──────────────┘ └──────────────┘    │   │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐    │   │
│  │  │ PVE Client   │ │ Database     │ │ Settings     │    │   │
│  │  │ Provider     │ │ Provider     │ │ Provider     │    │   │
│  │  └──────────────┘ └──────────────┘ └──────────────┘    │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
          │                    │                    │
          ▼                    ▼                    ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  PostgreSQL  │    │   Keycloak   │    │  Proxmox VE  │
│   Database   │    │     Auth     │    │   Cluster    │
└──────────────┘    └──────────────┘    └──────────────┘
```

### 2.2 Service Communication

```
Frontend (Next.js) ──► API (OData) ──► Core Services ──► Providers
                                                              │
                                    ┌─────────────────────────┼─────────────────────────┐
                                    │                         │                         │
                                    ▼                         ▼                         ▼
                              PostgreSQL              Proxmox VE API              ZeroTier
                              (Workspaces,            (VMs, Nodes,               (Overlay
                               Datacenters)            Templates)                Network)
```

---

## 3. Project Structure

### 3.1 Root Directory

```
MDC/
├── backend/                    # .NET Core backend services
├── frontend/                   # Next.js frontend application
├── .gitignore                  # Git ignore rules
└── DOCUMENTATION.md            # This file
```

### 3.2 Backend Structure

```
backend/
├── MDC.Api/                    # ASP.NET Core Web API
│   ├── Controllers/            # OData controllers
│   │   ├── DatacenterController.cs
│   │   ├── WorkspacesController.cs
│   │   └── DeviceConfigurationsController.cs
│   ├── Services/Authentication/
│   │   ├── ApiKeyAuthenticationHandler.cs
│   │   ├── KeycloakRoles.cs
│   │   └── UserRoles.cs
│   ├── Program.cs              # Application entry point
│   └── appsettings.json        # Configuration
│
├── MDC.Core/                   # Business logic layer
│   ├── Services/
│   │   ├── Api/                # Business services
│   │   │   ├── DatacenterService.cs
│   │   │   ├── WorkspaceService.cs
│   │   │   └── DeviceConfigurationService.cs
│   │   └── Providers/          # External integrations
│   │       ├── PVEClient/      # Proxmox VE API client
│   │       ├── MDCDatabase/    # Database operations
│   │       ├── Settings/       # Configuration provider
│   │       └── ZeroTier/       # ZeroTier networking
│   ├── Models/                 # Domain entities
│   ├── Migrations/             # EF Core migrations
│   └── Extensions/             # DI extensions
│
├── MDC.Shared/                 # Shared DTOs and models
│   └── Models/                 # API contracts
│       ├── Datacenter.cs
│       ├── Workspace.cs
│       ├── VirtualMachine.cs
│       └── VirtualNetwork.cs
│
├── MDC.*.Tests/                # Test projects
├── Documentation/              # Additional docs
├── Pipelines/                  # Azure DevOps YAML
├── Terraform/                  # IaC for PVE
├── helm/                       # Kubernetes Helm charts
├── pve-mock-responses/         # Mock API responses
├── docker-compose.yml          # Local development
├── Dockerfile_*                # Container definitions
└── MicroDataCenter.sln         # VS solution file
```

### 3.3 Frontend Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx            # Dashboard
│   │   ├── layout.tsx          # Root layout
│   │   ├── globals.css         # Global styles
│   │   ├── data-center/        # Datacenter pages
│   │   │   ├── page.tsx
│   │   │   ├── testbed/
│   │   │   ├── vmtemplates/
│   │   │   ├── switches/
│   │   │   ├── ports/
│   │   │   └── workstations/
│   │   ├── workspace/          # Workspace pages
│   │   │   ├── page.tsx
│   │   │   ├── [id]/page.tsx
│   │   │   └── create/page.tsx
│   │   ├── projects/           # Projects pages
│   │   ├── runbooks/           # Runbooks page
│   │   └── get-started/        # Onboarding
│   │
│   ├── components/
│   │   ├── AppSidebar.tsx      # Main navigation
│   │   ├── KeycloakProvider.tsx # Auth provider
│   │   ├── AuthGuard.tsx       # Route protection
│   │   └── ui/                 # Radix UI components
│   │
│   ├── config/
│   │   ├── keycloak.ts         # Keycloak config
│   │   ├── env.ts              # Environment config
│   │   └── authConfig.ts       # Auth settings
│   │
│   ├── services/
│   │   └── apiClient.ts        # API client + OData
│   │
│   ├── hooks/
│   │   └── useAuth.ts          # Auth hook
│   │
│   └── lib/
│       └── utils.ts            # Utilities
│
├── public/                     # Static assets
├── package.json
├── next.config.js
├── tailwind.config.js
└── tsconfig.json
```

---

## 4. Backend Components

### 4.1 API Controllers

#### DatacenterController (`/odata/Datacenter`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/GetDatacenterSites()` | List all datacenter sites |
| GET | `/GetDatacenter(site={site})` | Get datacenter details |

#### WorkspacesController (`/odata/{site}/Workspaces`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/Workspaces` | List workspaces (paginated) |
| GET | `/Workspaces({id})` | Get workspace by ID |
| POST | `/Workspaces` | Create new workspace |
| PATCH | `/Workspaces({id})` | Update workspace |
| DELETE | `/Workspaces({id})` | Delete workspace |

#### DeviceConfigurationsController (`/odata/DeviceConfigurations`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/DeviceConfigurations` | List device configurations |
| GET | `/DeviceConfigurations({id})` | Get configuration by ID |

### 4.2 Core Services

#### DatacenterService

```csharp
public interface IDatacenterService
{
    Task<IEnumerable<string>> GetDatacenterSitesAsync();
    Task<Datacenter> GetDatacenterAsync(string site);
    Task RepopulateDatabaseAsync(string site);
    Task RegisterDatacenterAsync(string site);
}
```

**Responsibilities:**
- Retrieve datacenter site configurations
- Sync datacenter state with PVE cluster
- Register new datacenters

#### WorkspaceService

```csharp
public interface IWorkspaceService
{
    Task<IEnumerable<Workspace>> GetAllAsync(string site);
    Task<Workspace> GetByIdAsync(string site, Guid id);
    Task<Workspace> CreateAsync(string site, WorkspaceDescriptor descriptor);
    Task<Workspace> UpdateAsync(string site, Guid id, Delta<Workspace> delta);
    Task DeleteAsync(string site, Guid id);
}
```

**Responsibilities:**
- CRUD operations for workspaces
- VM and network provisioning within workspaces
- Resource cleanup on deletion

### 4.3 Provider Services

#### PVEClientService

Proxies HTTP calls to Proxmox VE API:

```csharp
public interface IPVEClientService
{
    // Cluster operations
    Task<PVEClusterStatus[]> GetClusterStatusAsync();
    Task<PVEResource[]> GetClusterResourcesAsync();

    // Node operations
    Task<PVENodeStatus> GetNodeStatusAsync(string node);

    // VM operations
    Task<PVEQemuConfig> GetQemuConfigAsync(string node, int vmid);
    Task<string> CreateQemuCloneAsync(string node, int vmid, CloneRequest request);
    Task DeleteQemuAsync(string node, int vmid);
    Task StartQemuAsync(string node, int vmid);
    Task StopQemuAsync(string node, int vmid);

    // Task tracking
    Task<PVETaskStatus> GetTaskStatusAsync(string node, string upid);
}
```

#### MDCDatabaseService

Entity Framework Core-based persistence:

```csharp
public interface IMDCDatabaseService
{
    Task<DbDatacenter> GetDatacenterAsync(string site);
    Task<IEnumerable<DbWorkspace>> GetWorkspacesAsync(string site);
    Task<DbWorkspace> CreateWorkspaceAsync(DbWorkspace workspace);
    Task UpdateWorkspaceAsync(DbWorkspace workspace);
    Task DeleteWorkspaceAsync(Guid id);
}
```

---

## 5. Frontend Components

### 5.1 Page Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | Dashboard | Main overview with stats |
| `/get-started` | GetStarted | Onboarding flow |
| `/data-center` | DataCenter | Datacenter overview |
| `/data-center/testbed` | Testbed | Testbed management |
| `/data-center/vmtemplates` | VMTemplates | VM template library |
| `/data-center/switches` | Switches | Network switches |
| `/data-center/ports` | Ports | Port configuration |
| `/data-center/workstations` | Workstations | Physical workstations |
| `/workspace` | Workspaces | List all workspaces |
| `/workspace/[id]` | WorkspaceDetail | View/edit workspace |
| `/workspace/create` | CreateWorkspace | Workspace wizard |
| `/projects` | Projects | Project list |
| `/projects/[id]` | ProjectDetail | Project details |
| `/runbooks` | Runbooks | Automation runbooks |

### 5.2 Core Components

#### KeycloakProvider

React context provider for Keycloak authentication:

```typescript
// Usage in layout.tsx
<KeycloakProvider>
  <AppSidebar />
  {children}
</KeycloakProvider>
```

Features:
- Automatic token refresh (30s minimum validity)
- SSO detection on load
- PKCE (S256) authentication flow
- Role extraction from JWT claims

#### AuthGuard

Protects routes requiring authentication:

```typescript
<AuthGuard requiredRoles={['WorkspaceTenant']}>
  <ProtectedComponent />
</AuthGuard>
```

#### AppSidebar

Main navigation component with:
- Collapsible sidebar
- User profile display
- Role-based menu items
- Active route highlighting

### 5.3 API Client

#### Standard API Client

```typescript
import { apiClient } from '@/services/apiClient';

// GET request
const data = await apiClient.get('/endpoint');

// POST request
const result = await apiClient.post('/endpoint', { data });

// With authentication
const token = await getAccessToken();
const data = await apiClient.get('/endpoint', {
  headers: { Authorization: `Bearer ${token}` }
});
```

#### OData Client

```typescript
import { odataClient } from '@/services/apiClient';

// Collection query with OData operators
const workspaces = await odataClient.getCollection('Workspaces', {
  $filter: "status eq 'active'",
  $select: 'id,name,createdAt',
  $orderby: 'createdAt desc',
  $top: 10,
  $skip: 0
});

// Single entity
const workspace = await odataClient.getEntity('Workspaces', id);

// Create
const newWorkspace = await odataClient.createEntity('Workspaces', data);

// Update (PATCH)
await odataClient.patchEntity('Workspaces', id, { name: 'New Name' });

// Delete
await odataClient.deleteEntity('Workspaces', id);
```

---

## 6. Authentication & Authorization

### 6.1 Keycloak Configuration

**Realm:** `microdatacenter`

**Clients:**
| Client ID | Type | Purpose |
|-----------|------|---------|
| `mdc-web` | Public | Frontend SPA |
| `mdc-api` | Confidential | Backend API |

### 6.2 Authentication Flow

```
1. User visits frontend
         │
         ▼
2. KeycloakProvider checks SSO
         │
         ├── Authenticated ──► Show protected content
         │
         └── Not authenticated ──► Redirect to Keycloak login
                                          │
                                          ▼
                                   3. User logs in
                                          │
                                          ▼
                              4. Redirect back with auth code
                                          │
                                          ▼
                              5. Exchange code for tokens
                                          │
                                          ▼
                              6. Store tokens, show content
```

### 6.3 Role Hierarchy

```
GlobalAdministrator (highest)
        │
        ▼
DatacenterTechnician
        │
        ▼
WorkspaceManager
        │
        ▼
WorkspaceTenant (lowest)
```

**Policy Mappings:**

| Policy | Allowed Roles |
|--------|---------------|
| GlobalAdministrator | GlobalAdministrator |
| DatacenterTechnician | GlobalAdministrator, DatacenterTechnician |
| WorkspaceManager | GlobalAdministrator, DatacenterTechnician, WorkspaceManager |
| WorkspaceTenant | All roles |

### 6.4 API Key Authentication

Alternative authentication for service-to-service communication:

```bash
# Header
X-API-Key: your-api-key

# Query parameter
GET /odata/Workspaces?apikey=your-api-key
```

---

## 7. Database

### 7.1 PostgreSQL Schema

#### Tables

**datacenters**
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| site | VARCHAR | Unique site identifier |
| name | VARCHAR | Display name |
| settings | JSONB | Datacenter configuration |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update |

**workspaces**
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| datacenter_id | UUID | FK to datacenters |
| name | VARCHAR | Workspace name |
| address | VARCHAR | Network address |
| status | VARCHAR | Current status |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update |

**virtual_networks**
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| workspace_id | UUID | FK to workspaces |
| name | VARCHAR | Network name |
| config | JSONB | Network configuration |

### 7.2 Entity Framework Migrations

```bash
# Create migration
dotnet ef migrations add MigrationName -p MDC.Core -s MDC.Api

# Apply migrations
dotnet ef database update -p MDC.Core -s MDC.Api

# Or set API_RUN_DB_MIGRATIONS=true for auto-migration on startup
```

---

## 8. Infrastructure & Deployment

### 8.1 Docker Compose (Local Development)

**Services:**

| Service | Image | Port | Purpose |
|---------|-------|------|---------|
| mdc-db | PostgreSQL | 5432 | Database |
| mdc-auth | Keycloak | 8090 | Authentication |
| mdc-pve | Custom | 8001 | PVE Mock API |
| mdc-api | Custom | 8081 | Backend API |

**Start all services:**
```bash
cd backend
docker compose up -d
```

**View logs:**
```bash
docker compose logs -f mdc-api
```

### 8.2 Kubernetes (Helm)

**Deploy to k3s:**
```bash
cd backend/helm/microdatacenter

# Install
helm install mdc . -f values.yaml

# Upgrade
helm upgrade mdc . -f values.yaml

# Uninstall
helm uninstall mdc
```

**Key Helm Values:**
```yaml
api:
  replicaCount: 1
  image:
    repository: microdatacenterdevelopment.azurecr.io/mdc-api
    tag: latest
  resources:
    limits:
      cpu: 500m
      memory: 512Mi

ingress:
  enabled: true
  host: mdc.example.com

keycloak:
  realm: microdatacenter
  authServerUrl: http://microdatacenter-auth:8080/keycloak
```

### 8.3 CI/CD Pipeline

**Azure DevOps Pipeline Stages:**

1. **Test Stage**
   - Restore NuGet packages
   - Build solution
   - Run unit tests
   - Collect code coverage

2. **Build Stage**
   - Build Docker image
   - Tag with version
   - Push to ACR

**Trigger:** Commits to `main` branch affecting:
- `MDC.Api/**`
- `MDC.Core/**`
- `MDC.Shared/**`
- `Dockerfile_*`

---

## 9. API Reference

### 9.1 Base URLs

| Environment | URL |
|-------------|-----|
| Local | `http://localhost:8081/odata` |
| Development | `https://mdc-dev.example.com/odata` |
| Production | `https://mdc.example.com/odata` |

### 9.2 OData Query Options

```
$filter    - Filter results (e.g., $filter=status eq 'active')
$select    - Select specific fields
$expand    - Include related entities
$orderby   - Sort results
$top       - Limit results
$skip      - Skip results (pagination)
$count     - Include total count
```

### 9.3 Example Requests

**List workspaces with filtering:**
```http
GET /odata/primary/Workspaces?$filter=status eq 'active'&$top=10
Authorization: Bearer {token}
```

**Create workspace:**
```http
POST /odata/primary/Workspaces
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "My Workspace",
  "virtualMachines": [
    {
      "templateId": 100,
      "name": "vm-1"
    }
  ]
}
```

**Update workspace:**
```http
PATCH /odata/primary/Workspaces(guid'...')
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Updated Name"
}
```

### 9.4 API Documentation

- **Swagger UI:** `http://localhost:8081/swagger`
- **Scalar UI:** `http://localhost:8081/scalar`
- **OpenAPI Spec:** `http://localhost:8081/swagger/v1/swagger.json`

---

## 10. Configuration

### 10.1 Backend Environment Variables

```bash
# Database
POSTGRES_HOST=mdc-db
POSTGRES_DB=microdatacenter
POSTGRES_USER=mdc_user
POSTGRES_PASSWORD=secure_password
POSTGRES_PORT=5432

# Keycloak
KEYCLOAK_REALM=microdatacenter
KEYCLOAK_AUTH_SERVER_URL=http://localhost:8090
KEYCLOAK_RESOURCE=mdc-api
KEYCLOAK_SECRET=client-secret
KEYCLOAK_ISSUER=http://localhost:8090/realms/microdatacenter

# PVE
PVE_BASE_URL=http://mdc-pve:8000/api2/json/
PVE_TOKEN_ID=token-id
PVE_SECRET=token-secret

# API
API_PORT=8081
API_RUN_DB_MIGRATIONS=true
API_KEYS_ENABLED=true

# CORS
CORS__ALLOWEDORIGINS__0=http://localhost:3000
CORS__ALLOWEDORIGINS__1=http://localhost:3001
```

### 10.2 Frontend Environment Variables

```bash
# API
NEXT_PUBLIC_API_URL=http://localhost:8081

# Keycloak
NEXT_PUBLIC_KEYCLOAK_URL=http://localhost:8090
NEXT_PUBLIC_KEYCLOAK_REALM=microdatacenter
NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=mdc-web
```

---

## 11. Development Setup

### 11.1 Prerequisites

- Docker & Docker Compose
- Node.js 18+
- .NET 9 SDK
- Git

### 11.2 Quick Start

```bash
# Clone repository
git clone git@github.com:Tatu1984/mdc.git
cd mdc

# Start backend services
cd backend
cp .env.example .env  # Configure as needed
docker compose up -d

# Start frontend
cd ../frontend
npm install
npm run dev
```

### 11.3 Access Points

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3001 |
| API | http://localhost:8081 |
| Keycloak | http://localhost:8090 |
| API Docs | http://localhost:8081/scalar |

### 11.4 Default Credentials

| Service | Username | Password |
|---------|----------|----------|
| Keycloak Admin | admin | (see .env) |

---

## 12. Testing

### 12.1 Test Projects

| Project | Type | Coverage |
|---------|------|----------|
| MDC.Api.Tests | Unit | API controllers |
| MDC.Core.Tests | Unit | Services, PVE client |
| MDC.Shared.Tests | Unit | Model serialization |
| MDC.Integration.Tests | Integration | End-to-end flows |

### 12.2 Running Tests

```bash
# All unit tests
dotnet test --filter "Category!=Integration"

# With coverage
dotnet test --collect:"XPlat Code Coverage"

# Specific project
dotnet test MDC.Core.Tests
```

### 12.3 Mock Services

The `pve-mock-responses/` directory contains mock Proxmox VE API responses for testing without real infrastructure.

---

## 13. Future Improvements

### 13.1 High Priority

- [ ] **Real-time updates** - WebSocket/SignalR for live status
- [ ] **Audit logging** - Track all user actions
- [ ] **Resource quotas** - Limit resources per workspace
- [ ] **Backup/restore** - Workspace state management

### 13.2 Medium Priority

- [ ] **Multi-cluster support** - Manage multiple PVE clusters
- [ ] **Template marketplace** - Shareable VM templates
- [ ] **Cost tracking** - Resource usage metrics
- [ ] **API rate limiting** - Protect against abuse

### 13.3 Low Priority

- [ ] **Mobile app** - React Native companion app
- [ ] **CLI tool** - Command-line interface
- [ ] **Plugin system** - Extensible architecture
- [ ] **Dark mode** - Theme support in frontend

### 13.4 Technical Debt

- [ ] Increase test coverage to 80%+
- [ ] Add end-to-end tests with Playwright
- [ ] Implement structured logging with Serilog
- [ ] Add health check endpoints
- [ ] Document all API endpoints with examples

---

## Appendix

### A. Useful Commands

```bash
# Docker
docker compose up -d          # Start all services
docker compose down           # Stop all services
docker compose logs -f        # View logs
docker compose restart        # Restart services

# .NET
dotnet build                  # Build solution
dotnet run --project MDC.Api  # Run API locally
dotnet ef migrations add X    # Create migration

# Frontend
npm run dev                   # Development server
npm run build                 # Production build
npm run lint                  # Lint code
```

### B. Troubleshooting

**Port already in use:**
```bash
lsof -i :3000  # Find process
kill -9 PID    # Kill process
```

**Database connection failed:**
```bash
docker compose logs mdc-db  # Check DB logs
docker compose restart mdc-db
```

**Keycloak not responding:**
```bash
docker compose logs mdc-auth
# Wait for "Running the server" message
```

### C. Contact & Support

- **Repository:** https://github.com/Tatu1984/mdc
- **Issues:** https://github.com/Tatu1984/mdc/issues

---

*This documentation was generated on January 2025. Keep it updated as the project evolves.*
