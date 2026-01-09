# MicroDataCenter Helm Chart

A Helm chart for deploying the MicroDataCenter application on Kubernetes (k3s).

## Quick Start

```bash
# Install with default values
helm install microdatacenter ./microdatacenter --create-namespace --namespace microdatacenter

# Install with custom values
helm install microdatacenter ./microdatacenter \
  --namespace microdatacenter \
  --create-namespace \
  --values custom-values.yaml
```

## Components

This chart deploys the following components:

- **API Service** (.NET Core) - Main application API
- **Web Application** (Next.js) - Frontend web interface  
- **Authentication** (Keycloak) - Identity and access management
- **Database** (PostgreSQL) - Data persistence
- **Ingress** (Traefik) - Load balancing and SSL termination

## Configuration

### Required Configuration

Create a `custom-values.yaml` file:

```yaml
# Image configuration
image:
  tag: "1.0.0-36"  # Your latest build tag

# Domain configuration
ingress:
  host: "microdatacenter.yourdomain.com"
  tls:
    letsencrypt:
      email: "admin@yourdomain.com"

# Secrets (use strong passwords)
secrets:
  dbPassword: "secure-database-password"
  dbConnectionString: "Host=microdatacenter-db;Port=5432;Database=microdatacenter;Username=mdc_user;Password=secure-database-password;SSL Mode=Prefer"
  keycloakAdmin:
    password: "secure-admin-password"
  
  # Proxmox API credentials
  proxmoxCredentials:
    baseUrl: "https://your-proxmox.local:8006/api2/json/"
    tokenId: "user@pam!tokenname" 
    secret: "your-api-token"
```

### TLS Options

#### Self-signed (Development)
```yaml
ingress:
  tls:
    provider: "selfsigned"
```

#### Let's Encrypt (Production)
```yaml
ingress:
  tls:
    provider: "letsencrypt"
    letsencrypt:
      email: "your-email@domain.com"
```

#### Custom Certificate
```yaml
ingress:
  tls:
    provider: "custom"
    custom:
      secretName: "your-tls-secret"
```

## Prerequisites

- Kubernetes 1.19+
- Helm 3.0+
- cert-manager (for TLS certificates)
- Ingress controller (Traefik recommended for k3s)

## Installation

### 1. Install Dependencies

```bash
# Install cert-manager
helm repo add jetstack https://charts.jetstack.io
helm repo update
helm install cert-manager jetstack/cert-manager \
  --namespace cert-manager \
  --create-namespace \
  --version v1.13.0 \
  --set installCRDs=true
```

### 2. Create Image Pull Secret (if using private registry)

```bash
kubectl create secret docker-registry azure-registry-secret \
  --docker-server=microdatacenterdevelopment.azurecr.io \
  --docker-username=your-username \
  --docker-password=your-password
```

### 3. Install Application

```bash
helm install microdatacenter ./microdatacenter \
  --namespace microdatacenter \
  --create-namespace \
  --values custom-values.yaml
```

## Scaling

### Manual Scaling
```yaml
api:
  replicaCount: 3
web:
  replicaCount: 2
```

### Auto Scaling
```yaml
api:
  autoscaling:
    enabled: true
    minReplicas: 2
    maxReplicas: 10
    targetCPUUtilizationPercentage: 70
```

## Monitoring

```bash
# Check deployment status
kubectl get pods -n microdatacenter

# Check ingress
kubectl get ingress -n microdatacenter

# Check certificates
kubectl get certificates -n microdatacenter

# View logs
kubectl logs -l app.kubernetes.io/component=api -n microdatacenter
```

## Upgrading

```bash
helm upgrade microdatacenter ./microdatacenter \
  --namespace microdatacenter \
  --values custom-values.yaml
```

## Uninstalling

```bash
helm uninstall microdatacenter --namespace microdatacenter
kubectl delete namespace microdatacenter
```

## Values Reference

| Parameter | Description | Default |
|-----------|-------------|---------|
| `image.tag` | Application image tag | `1.0.0` |
| `ingress.host` | Domain name for ingress | `microdatacenter.local` |
| `ingress.tls.provider` | TLS provider (selfsigned/letsencrypt/custom) | `selfsigned` |
| `db.external` | Use external database | `false` |
| `db.postgresql.persistence.size` | Database storage size | `20Gi` |
| `secrets.dbPassword` | Database password | Auto-generated |
| `secrets.proxmoxCredentials.tokenId` | Proxmox API token ID | `""` |

For complete configuration options, see [values.yaml](../helm/microdatacenter/values.yaml).

## Troubleshooting

### Common Issues

1. **Pods pending**: Check resource limits and node capacity
2. **TLS not working**: Verify cert-manager and domain DNS
3. **Database connection failed**: Check credentials and network policies
4. **404 errors**: Verify ingress paths and service endpoints

### Debug Commands

```bash
# Check events
kubectl get events -n microdatacenter --sort-by='.lastTimestamp'

# Port forward for testing
kubectl port-forward svc/microdatacenter-web 3000:3000 -n microdatacenter
kubectl port-forward svc/microdatacenter-api 8080:8080 -n microdatacenter

# Check certificate issues
kubectl describe certificate microdatacenter-tls -n microdatacenter
```

## Packaging and Distribution

### Package the Chart

```bash
# Lint the chart
helm lint ./microdatacenter

# Package the chart
helm package ./microdatacenter

# This creates microdatacenter-1.0.0.tgz
```

### Using Packaged Chart

```bash
# Install from package
helm install microdatacenter microdatacenter-1.0.0.tgz \
  --namespace microdatacenter \
  --create-namespace \
  --values custom-values.yaml
```

### Chart Repository

```bash
# Create/update chart repository index
helm repo index . --url https://your-domain.com/helm-charts

# Upload to your chart repository
# Example for GitHub Pages or any web server
# Upload: microdatacenter-1.0.0.tgz and index.yaml

# Users can then add your repository
helm repo add microdatacenter https://your-domain.com/helm-charts
helm repo update
helm install microdatacenter microdatacenter/microdatacenter
```

## CI/CD Pipeline Integration

This chart can be automatically packaged and released using Azure DevOps pipelines. See the pipeline examples in the `Pipelines/` directory:

- `MDC_Helm_Release.yml` - Automated chart packaging and release
- Integration with existing Docker image builds

### Automated Versioning

The chart version automatically syncs with your application version from the `VERSION` file, ensuring consistency between Docker images and Helm releases.

## Support

For detailed deployment instructions, see [K3S_DEPLOYMENT_GUIDE.md](../Documentation/K3S_DEPLOYMENT_GUIDE.md)