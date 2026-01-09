# MicroDataCenter Pipeline Versioning Guide

## Safe Deployment Strategy

This project uses a **VERSION + BuildID** approach with manual approval gates to prevent accidental overwrites.

### Version Structure

```
Global: VERSION (1.0.0)
Docker Tag Format: VERSION-BuildID (e.g., 1.0.0-20240819.5)
```

### Tag Format

Docker images are tagged with a **single, unique tag**:
- `{VERSION}-{BuildID}` (e.g., `1.0.0-20240819.5`)

**No `latest` tags** - Every image is uniquely versioned and immutable.

## Pipeline Files

### 1. CI Pipeline (Automatic)
- **File**: `Pipelines/MDC_CI_Only.yml`
- **Purpose**: Automatic code validation
- **Triggers**: All code changes, PRs
- **Actions**: Tests only, no image pushing
- **When**: Runs automatically on every commit

### 2. Deployment Pipeline (Manual)
- **File**: `Pipelines/MDC_MultiService_Hybrid.yml`
- **Purpose**: Build and push Docker images
- **Triggers**: Manual execution only
- **Actions**: Tests → Manual Approval → Build & Push images
- **When**: Run manually when ready to deploy

## Safety Features

### 1. No Automatic Deployments
- **CI Pipeline**: Tests only, never pushes images
- **Deployment Pipeline**: Requires manual execution

### 2. Manual Approval Gate
- **Environment**: `production-approval` (needs to be created in Azure DevOps)
- **Purpose**: Human verification before image push
- **Process**: Tests pass → Manual approval → Build & push

### 3. Unique Versioning
- **Every build** gets a unique tag
- **No overwrites** of existing images
- **Immutable** image tags

## Testing Strategy

### Unit Tests
- **Always run** before building Docker images
- **Fail fast** - build stops if tests fail
- **Coverage reporting** included
- **Test projects**: MDC.Api.Tests, MDC.Core.Tests, MDC.Shared.Tests

### Integration Tests
- Excluded from pipeline by default (can be enabled)
- Located in: MDC.Integration.Tests

## Deployment Workflow

### Step 1: Code Development
1. Make code changes
2. Commit and push to any branch
3. **CI Pipeline** runs automatically and validates code

### Step 2: Version Update (When Ready to Deploy)
1. Update global `VERSION` file (e.g., `1.0.0` → `1.0.1`)
2. Commit and push to main branch

### Step 3: Manual Deployment
1. Go to Azure DevOps Pipelines
2. **Manually run** `MDC_MultiService_Hybrid.yml` pipeline
3. Tests run automatically
4. **Manual approval** required at approval gate
5. After approval, images build and push with tag `{VERSION}-{BuildID}`

### Step 4: Use Images
- Pull images using the exact tag: `docker pull your-registry/mdc-api:1.0.1-20240819.5`

## Docker Registry Organization

All images pushed to **ADR_Dev** registry:
- `mdc-api`: API service images
- `mdc-web`: Web service images  
- `mdc-db`: Database service images
- `mdc-pve`: PVE service images
- `mdc-auth`: Auth service images

## Setup Instructions

### 1. Create Azure DevOps Environment
```bash
# In Azure DevOps → Environments → Create Environment
Name: production-approval
Add manual approval gate with required reviewers
```

### 2. Pipeline Setup
```bash
# Set up both pipelines in Azure DevOps:
1. MDC_CI_Only.yml → Automatic triggers enabled
2. MDC_MultiService_Hybrid.yml → Manual triggers only
```

## Examples

### Scenario 1: Bug Fix Development
```bash
# 1. Developer makes changes
git checkout -b feature/fix-auth-bug
# make changes to code
git commit -m "Fix authentication bug"
git push origin feature/fix-auth-bug

# 2. CI Pipeline runs automatically - tests validate changes
# 3. Create PR - CI runs again on PR
# 4. Merge to main after approval
```

### Scenario 2: Deploy Bug Fix
```bash
# 1. Update version for deployment
echo "1.0.1" > VERSION
git add VERSION
git commit -m "Release version 1.0.1 - Fix authentication bug"
git push origin main

# 2. Manually run MDC_MultiService_Hybrid.yml pipeline
# 3. Tests pass → Manual approval → Images build
# Result: Images tagged as 1.0.1-20240819.8
```

### Scenario 3: Major Release
```bash
# 1. Update version
echo "2.0.0" > VERSION
git add VERSION  
git commit -m "Release version 2.0.0 - Major feature release"
git push origin main

# 2. Manually run deployment pipeline
# 3. Approve at gate → All services build
# Result: All images tagged as 2.0.0-20240819.12
```

## Best Practices

1. **Never overwrite images**: Each build gets a unique tag
2. **Test continuously**: CI pipeline validates every change
3. **Deploy deliberately**: Manual approval prevents accidents  
4. **Version semantically**: Use semver (1.0.0 → 1.0.1 → 1.1.0 → 2.0.0)
5. **Clear commits**: Use descriptive commit messages
6. **Track deployments**: Document which versions are deployed where

## Image Usage

```bash
# Always use specific tags, never 'latest'
docker pull your-registry/mdc-api:1.0.1-20240819.8
docker pull your-registry/mdc-web:1.0.1-20240819.8

# In docker-compose.yml or Kubernetes manifests:
image: your-registry/mdc-api:1.0.1-20240819.8
```