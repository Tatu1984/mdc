# MicroDataCenter K3s Deployment Guide

This guide provides step-by-step instructions for deploying the MicroDataCenter application on a k3s Kubernetes cluster using Helm.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [VM Setup and Configuration](#vm-setup-and-configuration)
3. [K3s Installation](#k3s-installation)
4. [Helm Installation](#helm-installation)
5. [Cert-Manager Installation](#cert-manager-installation)
6. [Application Deployment](#application-deployment)
7. [Configuration Options](#configuration-options)
8. [TLS Certificate Options](#tls-certificate-options)
9. [Troubleshooting](#troubleshooting)
10. [Maintenance](#maintenance)

## Prerequisites

- Ubuntu 20.04 or 22.04 LTS server
- Minimum 4GB RAM, 2 CPU cores
- 50GB disk space
- Static IP address configured
- Domain name pointing to the server (for TLS certificates)

## VM Setup and Configuration

### 1. Update System

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git nano htop
```

### 2. Configure Firewall

```bash
# Enable UFW
sudo ufw enable

# Allow SSH
sudo ufw allow 22

# Allow k3s ports
sudo ufw allow 6443  # Kubernetes API server
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS

# Allow k3s internal ports
sudo ufw allow 10250  # kubelet
sudo ufw allow from 10.42.0.0/16  # Pod network
sudo ufw allow from 10.43.0.0/16  # Service network
```

### 3. Configure DNS (Optional but Recommended)

```bash
# Set static DNS servers
echo "DNS=8.8.8.8 8.8.4.4" | sudo tee -a /etc/systemd/resolved.conf
sudo systemctl restart systemd-resolved
```

### 4. Disable Swap (Required for Kubernetes)

```bash
sudo swapoff -a
sudo sed -i '/ swap / s/^\(.*\)$/#\1/g' /etc/fstab
```

## K3s Installation

### 1. Install K3s

```bash
# Basic installation with Traefik as the default ingress controller
curl -sfL https://get.k3s.io | sh -s - --write-kubeconfig-mode 644

# Alternative: Install with specific IP (for multi-homed servers)
# Replace YOUR_SERVER_IP with the IP you want to use for ingress
# curl -sfL https://get.k3s.io | INSTALL_K3S_EXEC="--node-external-ip=YOUR_SERVER_IP --node-ip=YOUR_SERVER_IP" sh -s - --write-kubeconfig-mode 644

# Verify installation
sudo k3s kubectl get nodes
```

### 2. Configure kubectl for Regular User

```bash
# Create .kube directory
mkdir -p $HOME/.kube

# Copy k3s config
sudo cp /etc/rancher/k3s/k3s.yaml $HOME/.kube/config
sudo chown $USER:$USER $HOME/.kube/config

# Verify access
kubectl get nodes
```

### 3. Install kubectl (if not using k3s kubectl)

```bash
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
```

## Helm Installation

```bash
# Download and install Helm
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

# Verify installation
helm version
```

## Cert-Manager Installation

Cert-manager is required for automatic TLS certificate management.

```bash
# Add Helm repository
helm repo add jetstack https://charts.jetstack.io
helm repo update

# Create namespace
kubectl create namespace cert-manager

# Install cert-manager
helm install cert-manager jetstack/cert-manager \
  --namespace cert-manager \
  --create-namespace \
  --version v1.13.0 \
  --set installCRDs=true

# Verify installation
kubectl get pods --namespace cert-manager
```

## Traefik Configuration (Multi-homed Servers)

If your server has multiple network interfaces and you need to configure which IP Traefik should use for ingress traffic, follow these steps:

### 1. Check Current Network Configuration

```bash
# Check all available IPs
ip addr show

# Check current ingress configuration
kubectl get svc -n kube-system -l app.kubernetes.io/name=traefik
kubectl get ingress -n microdatacenter -o wide
```

### 2. Configure Traefik to Bind to Specific IP

```bash
# Replace YOUR_PREFERRED_IP with the IP address you want to use
export TRAEFIK_IP="YOUR_PREFERRED_IP"

# Create Traefik configuration
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: ConfigMap
metadata:
  name: traefik-config
  namespace: kube-system
data:
  traefik.yml: |
    entryPoints:
      web:
        address: "${TRAEFIK_IP}:80"
      websecure:
        address: "${TRAEFIK_IP}:443"
    certificatesResolvers:
      letsencrypt:
        acme:
          email: admin@yourdomain.com
          storage: /data/acme.json
          httpChallenge:
            entryPoint: web
EOF
```

### 3. Update Traefik Deployment

```bash
# Patch Traefik deployment to use the configuration
kubectl patch deployment traefik -n kube-system -p '
{
  "spec": {
    "template": {
      "spec": {
        "volumes": [
          {
            "name": "traefik-config",
            "configMap": {
              "name": "traefik-config"
            }
          }
        ],
        "containers": [
          {
            "name": "traefik",
            "volumeMounts": [
              {
                "name": "traefik-config",
                "mountPath": "/etc/traefik",
                "readOnly": true
              }
            ],
            "args": [
              "--configfile=/etc/traefik/traefik.yml"
            ]
          }
        ]
      }
    }
  }
}'

# Restart Traefik to apply changes
kubectl rollout restart deployment/traefik -n kube-system

# Verify the restart
kubectl rollout status deployment/traefik -n kube-system
```

### 4. Alternative: Use NodePort Access

If you prefer not to modify Traefik configuration, you can access the application using NodePort:

```bash
# Check NodePort assignments
kubectl get svc -n kube-system traefik

# Access application using any server IP with NodePort
# Usually port 30080 for HTTP and 30443 for HTTPS
https://YOUR_PREFERRED_IP:30443
```

### 5. Update Local DNS

Add the following to your local hosts file to access via domain name:

**Windows:** `C:\Windows\System32\drivers\etc\hosts`  
**Linux/Mac:** `/etc/hosts`

```
YOUR_PREFERRED_IP microdatacenter.yourdomain.com
```

## Application Deployment

### 1. Prepare Deployment Directory

```bash
# Create deployment directory
mkdir -p ~/microdatacenter
cd ~/microdatacenter

# Option 1: From Registry
helm registry login microdatacenterdevelopment.azurecr.io

# Option 2: Download the Helm chart: Extract from release package
tar -xzf microdatacenter-helm-chart.tar.gz
```

### 2. Create Custom Values File

Create a `custom-values.yaml` file with your specific configuration:

```yaml
# custom-values.yaml

# Global settings
global:
  imageRegistry: "microdatacenterdevelopment.azurecr.io"
  imagePullSecrets:
    - name: azure-registry-secret

# Update with your latest image tags
image:
  tag: "1.0.0-36"  # Replace with your latest build

# Ingress configuration
ingress:
  enabled: true
  className: "traefik"
  host: "microdatacenter.yourdomain.com"  # Replace with your domain
  
  tls:
    enabled: true
    provider: "letsencrypt"  # Options: selfsigned, letsencrypt, custom
    letsencrypt:
      email: "admin@yourdomain.com"  # Replace with your email

# Database configuration
db:
  enabled: true
  external: false
  postgresql:
    persistence:
      enabled: true
      size: 20Gi

# Secrets (use strong passwords in production)
secrets:
  dbPassword: "your-secure-db-password"
  dbConnectionString: "Host=microdatacenter-db;Port=5432;Database=microdatacenter;Username=mdc_user;Password=your-secure-db-password;SSL Mode=Prefer"
  keycloakAdmin:
    username: "admin"
    password: "your-keycloak-admin-password"
  keycloakDbPassword: "your-keycloak-db-password"
  
  # Proxmox API credentials
  proxmoxCredentials:
    baseUrl: "https://your-proxmox.local:8006/api2/json/"
    tokenId: "user@pam!tokenname"
    secret: "your-proxmox-api-token"

# Resource limits (adjust based on your VM specs)
api:
  resources:
    limits:
      cpu: 1000m
      memory: 1Gi
    requests:
      cpu: 500m
      memory: 512Mi

auth:
  resources:
    limits:
      cpu: 1000m
      memory: 2Gi
    requests:
      cpu: 500m
      memory: 1Gi
```

### 3. Create Image Pull Secret (if using private registry)

```bash
kubectl create secret docker-registry azure-registry-secret \
  --namespace microdatacenter \
  --docker-server=microdatacenterdevelopment.azurecr.io \
  --docker-username=your-username \
  --docker-password=your-password \
  --docker-email=your-email@domain.com
```

### 4. Deploy the Application

```bash
# Create namespace
kubectl create namespace microdatacenter

# Deploy with custom values

# Option 1: From Registry
helm install microdatacenter oci://microdatacenterdevelopment.azurecr.io/charts/microdatacenter --version 1.0.0-39 --namespace microdatacenter --values custom-values.yaml --set image.tag="1.0.0-36"

#Option 2: From downloaded file
helm install microdatacenter ./microdatacenter --namespace microdatacenter --values custom-values.yaml --set image.tag="1.0.0-36"

# Check deployment status
kubectl get pods -n microdatacenter
kubectl get services -n microdatacenter
kubectl get ingress -n microdatacenter
```

### 5. Verify Deployment

```bash
# Check all resources
kubectl get all -n microdatacenter

# Check certificate status (if using TLS)
kubectl get certificates -n microdatacenter
kubectl describe certificate microdatacenter-tls -n microdatacenter

# Check logs if needed
kubectl logs -l app.kubernetes.io/component=api -n microdatacenter
kubectl logs -l app.kubernetes.io/component=auth -n microdatacenter
```

## Configuration Options

### Environment Variables

The Helm chart supports extensive environment variable configuration:

#### API Service
- Database connection strings
- JWT secrets
- Proxmox API configuration
- CORS settings
- Logging levels

#### Web Application (Runtime Environment Variables)
The web application now uses `next-runtime-env` for true runtime configuration:
- `NEXT_PUBLIC_API_URL` - API endpoint URL (configurable at runtime)
- `NEXT_PUBLIC_KEYCLOAK_URL` - Keycloak URL (configurable at runtime)
- `NEXT_PUBLIC_KEYCLOAK_REALM` - Keycloak realm (configurable at runtime)
- `NEXT_PUBLIC_KEYCLOAK_CLIENT_ID` - Keycloak client ID (configurable at runtime)

These variables can be changed without rebuilding the Docker image, allowing for "build once, deploy many" scenarios.

#### Keycloak
- Admin credentials
- Database configuration
- Hostname settings

### Scaling Configuration

```yaml
# Enable autoscaling for API service
api:
  autoscaling:
    enabled: true
    minReplicas: 2
    maxReplicas: 10
    targetCPUUtilizationPercentage: 70

# Manual scaling
api:
  replicaCount: 3
web:
  replicaCount: 2
```

### Storage Configuration

```yaml
# Database persistence
db:
  postgresql:
    persistence:
      enabled: true
      storageClass: "local-path"  # k3s default
      size: 50Gi

# Keycloak persistence
auth:
  persistence:
    enabled: true
    storageClass: "local-path"
    size: 5Gi
```

## TLS Certificate Options

### Option 1: Self-Signed Certificates (Development)

```yaml
ingress:
  tls:
    provider: "selfsigned"
```

### Option 2: Let's Encrypt (Production)

```yaml
ingress:
  tls:
    provider: "letsencrypt"
    letsencrypt:
      email: "your-email@domain.com"
      # Use staging for testing
      server: "https://acme-staging-v02.api.letsencrypt.org/directory"
      # Use production when ready
      # server: "https://acme-v02.api.letsencrypt.org/directory"
```

### Option 3: Custom Certificate

```bash
# Create TLS secret with your certificate
kubectl create secret tls microdatacenter-tls \
  --cert=path/to/your/certificate.crt \
  --key=path/to/your/private.key \
  --namespace microdatacenter
```

```yaml
ingress:
  tls:
    provider: "custom"
    custom:
      secretName: "microdatacenter-tls"
```

## Troubleshooting

### Common Issues

#### 1. Pods Stuck in Pending State

```bash
# Check node resources
kubectl describe nodes
kubectl top nodes

# Check PVC status
kubectl get pvc -n microdatacenter
kubectl describe pvc -n microdatacenter
```

#### 2. Database Connection Issues

```bash
# Check database pod logs
kubectl logs -l app.kubernetes.io/component=database -n microdatacenter

# Check database service
kubectl get svc -l app.kubernetes.io/component=database -n microdatacenter

# Test database connection from API pod
kubectl exec -it deployment/microdatacenter-api -n microdatacenter -- /bin/bash
# Then test connection inside pod
```

#### 3. TLS Certificate Issues

```bash
# Check certificate status
kubectl get certificates -n microdatacenter
kubectl describe certificate microdatacenter-tls -n microdatacenter

# Check cert-manager logs
kubectl logs -n cert-manager deployment/cert-manager

# Check challenge status (for Let's Encrypt)
kubectl get challenges -n microdatacenter
```

#### 4. Ingress Issues

```bash
# Check Traefik status
kubectl get pods -n kube-system -l app.kubernetes.io/name=traefik

# Check ingress configuration
kubectl describe ingress microdatacenter -n microdatacenter

# Check Traefik logs
kubectl logs -n kube-system deployment/traefik
```

### Useful Commands

```bash
# Check resource usage
kubectl top pods -n microdatacenter
kubectl top nodes

# Get events
kubectl get events -n microdatacenter --sort-by='.lastTimestamp'

# Port forward for debugging
kubectl port-forward svc/microdatacenter-api 8080:8080 -n microdatacenter
kubectl port-forward svc/microdatacenter-auth 8090:8080 -n microdatacenter

# Check configuration
helm get values microdatacenter -n microdatacenter
```

## Maintenance

### Updating the Application

```bash
# Update image tags in custom-values.yaml
# Then upgrade
helm upgrade microdatacenter ./microdatacenter \
  --namespace microdatacenter \
  --values custom-values.yaml

# Check rollout status
kubectl rollout status deployment/microdatacenter-api -n microdatacenter
kubectl rollout status deployment/microdatacenter-web -n microdatacenter
```

### Backup

```bash
# Backup database
kubectl exec -it deployment/microdatacenter-db -n microdatacenter -- pg_dumpall -U mdc_user > backup.sql

# Backup Keycloak data
kubectl exec -it deployment/microdatacenter-auth -n microdatacenter -- tar -czf - /opt/keycloak/data > keycloak-backup.tar.gz
```

### Monitoring

```bash
# Watch pods
watch kubectl get pods -n microdatacenter

# Monitor logs
kubectl logs -f deployment/microdatacenter-api -n microdatacenter
kubectl logs -f deployment/microdatacenter-web -n microdatacenter
kubectl logs -f deployment/microdatacenter-auth -n microdatacenter
```

### Uninstalling

```bash
# Uninstall application
helm uninstall microdatacenter -n microdatacenter

# Delete namespace (this will delete all data)
kubectl delete namespace microdatacenter

# Cleanup cert-manager (optional)
helm uninstall cert-manager -n cert-manager
kubectl delete namespace cert-manager
```

## Security Considerations

1. **Use strong passwords** for all services
2. **Enable TLS** for production deployments
3. **Regularly update** container images
4. **Monitor logs** for suspicious activity
5. **Backup data** regularly
6. **Use network policies** if needed
7. **Limit resource usage** appropriately

## Performance Tips

1. **Allocate sufficient resources** based on your workload
2. **Use SSD storage** for better database performance
3. **Enable caching** where appropriate
4. **Monitor resource usage** and scale accordingly
5. **Use ingress-level caching** for static content

---

## Additional Resources

- [Helm Chart Documentation](HELM_CHART_README.md) - Complete Helm chart reference
- [Values Example File](values-example.yaml) - Example configuration file

For additional support, please refer to the project documentation or create an issue in the project repository.