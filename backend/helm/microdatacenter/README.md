# MicroDataCenter Helm Chart

This is the Helm chart for deploying MicroDataCenter on Kubernetes.

## Documentation

For complete installation and configuration instructions, please see:

- **[Helm Chart Documentation](../../Documentation/HELM_CHART_README.md)** - Complete chart reference and configuration options
- **[K3s Deployment Guide](../../Documentation/K3S_DEPLOYMENT_GUIDE.md)** - Step-by-step deployment instructions  
- **[Values Example](../../Documentation/values-example.yaml)** - Example configuration file

## Quick Start

```bash
# Create custom values file from example
cp ../../Documentation/values-example.yaml custom-values.yaml

# Edit custom-values.yaml with your settings
nano custom-values.yaml

# Install the chart
helm install microdatacenter . \
  --namespace microdatacenter \
  --create-namespace \
  --values custom-values.yaml
```

## Chart Information

- **Version**: See Chart.yaml
- **App Version**: See Chart.yaml
- **Components**: API, Web, Database (PostgreSQL), Auth (Keycloak)
- **Dependencies**: cert-manager for TLS certificates