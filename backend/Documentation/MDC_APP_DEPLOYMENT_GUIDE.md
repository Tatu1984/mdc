# MicroDataCenter K3s Deployment Guide

This guide provides step-by-step instructions for deploying the MicroDataCenter application on a k3s Kubernetes cluster using Helm.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [VM Setup and Configuration](#vm-setup-and-configuration)
3. [K3s Installation](#k3s-installation)
4. [Helm Installation](#helm-installation)
5. [Cert-Manager Installation](#cert-manager-installation)
6. [Application Deployment](#application-deployment)

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
sudo apt install -y curl 
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
kubectl get nodes
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

### Update Local DNS (On local network)

Add the following to your local hosts file to access via domain name:

**Windows:** `C:\Windows\System32\drivers\etc\hosts`  
**Linux/Mac:** `/etc/hosts`

```
YOUR_PREFERRED_IP microdatacenter.local
```

## Application Deployment

### 1. Prepare Deployment Directory

```bash
# Create deployment directory
mkdir -p ~/microdatacenter
cd ~/microdatacenter

# Login to the OCI Registry
helm registry login microdatacenterdevelopment.azurecr.io
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
  host: "microdatacenter.local"  # Replace with your domain

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

web:
  replicaCount: 1
  env:
    NEXT_PUBLIC_API_URL: "/odata"  # Will be set to API service URL
    NEXT_PUBLIC_KEYCLOAK_URL: "/keycloak" # Keycloak URL
    NEXT_PUBLIC_KEYCLOAK_REALM: "microdatacenter" # Keycloak realm
    NEXT_PUBLIC_KEYCLOAK_CLIENT_ID: "mdc-web" # Keycloak client ID

api:
  replicaCount: 1
  probes:
    enabled: false
  env:
    ASPNETCORE_ENVIRONMENT: "Development"
    API_RUN_DB_MIGRATIONS: true
    KEYCLOAK_REALM: "microdatacenter"
    KEYCLOAK_AUTH_SERVER_URL: "http://microdatacenter-auth:8080/keycloak"
    KEYCLOAK_RESOURCE: "mdc-api"
    KEYCLOAK_SECRET: "mdc-api-client-secret-2024"
    KEYCLOAK_VERIFY_TOKEN_AUDIENCE: false
    KEYCLOAK_ISSUER: "https://microdatacenter.local/keycloak/realms/microdatacenter"
    API_KEYS_ENABLED: "true"
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

# Secrets (use strong passwords in production)
secrets:
  dbPassword: "your-secure-db-password"
  dbConnectionString: "Host=microdatacenter-db;Port=5432;Database=microdatacenter;Username=mdc_user;Password=your-secure-db-password;SSL Mode=Prefer"  # Complete connection string with actual password
  keycloakAdmin:
    username: "admin"
    password: "your-keycloak-admin-password"
  keycloakDbPassword: "your-keycloak-db-password"

  # Proxmox API credentials
  proxmoxCredentials:
    baseUrl: "https://172.22.1.11:8006/api2/json/"
    tokenId: "MDCApiApplication@pve!MDCApi"
    secret: "12345677-1234-1234-1234-123456789012"

```

### 3. Create Image Pull Secret (if using private registry)

```bash
kubectl create secret docker-registry azure-registry-secret \
  --namespace microdatacenter \
  --docker-server=microdatacenterdevelopment.azurecr.io \
  --docker-username=your-username \
  --docker-password=your-password \
  --docker-email=your-email@domain.com
  --create-namespace
```

### 4. Deploy the Application

```bash
# Deploy with custom values (from OCI registry)
helm install microdatacenter oci://microdatacenterdevelopment.azurecr.io/charts/microdatacenter --version 1.0.1-122 --namespace microdatacenter --values custom-values.yaml --set image.tag="1.0.1-123"

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

### 6. Configure keycloak

browse to the /keycloak path, login with admin, then create the realm by importing the configuration file ```microdatacenter-realm-simple.json```

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
