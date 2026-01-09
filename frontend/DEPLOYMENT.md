# MicroDataCluster Deployment Guide

> **Status**: Pending client update
> **Last Updated**: January 2026

---

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         PRODUCTION                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌──────────────┐     ┌──────────────┐     ┌──────────────┐   │
│   │   Vercel     │────▶│   Railway    │────▶│   Neon DB    │   │
│   │  (Frontend)  │     │  (mdc-api)   │     │ (PostgreSQL) │   │
│   └──────────────┘     └──────────────┘     └──────────────┘   │
│          │                    │                                  │
│          │                    │                                  │
│          ▼                    ▼                                  │
│   ┌──────────────────────────────────────┐                      │
│   │     Railway or Cloud-IAM             │                      │
│   │         (Keycloak)                   │                      │
│   └──────────────────────────────────────┘                      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Components Overview

| Component | Local | Production | Notes |
|-----------|-------|------------|-------|
| Frontend (Next.js) | localhost:3000 | Vercel | Automatic deployments from Git |
| Backend API (.NET) | localhost:8081 | Railway | Docker container |
| Database (PostgreSQL) | Docker | Neon DB | Serverless PostgreSQL |
| Auth (Keycloak) | localhost:8090 | Railway/Cloud-IAM | OpenID Connect provider |
| PVE Mock | localhost:8006 | N/A or Railway | Only needed for testing |

---

## Step 1: Set Up Neon Database

1. Go to https://neon.tech and create an account
2. Create a new project named `microdatacenter`
3. Copy the connection string:
   ```
   postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
4. Run the database migrations (from backend):
   ```bash
   # The API will run migrations on startup if API_RUN_DB_MIGRATIONS=true
   ```

---

## Step 2: Deploy Backend API to Railway

### Option A: Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
cd /path/to/backend
railway init

# Deploy
railway up
```

### Option B: Railway Dashboard

1. Go to https://railway.app
2. Click "New Project" → "Deploy from GitHub repo"
3. Select the MDC backend repository
4. Configure the service:
   - **Root Directory**: `/backend`
   - **Dockerfile Path**: `Dockerfile_MicroDataCenter_Api`

### Environment Variables for Backend

```env
# Database (Neon)
ConnectionStrings__DefaultConnection=postgresql://user:password@ep-xxx.neon.tech/neondb?sslmode=require

# Keycloak
KEYCLOAK_REALM=microdatacenter
KEYCLOAK_AUTH_SERVER_URL=https://your-keycloak.railway.app
KEYCLOAK_RESOURCE=mdc-api
KEYCLOAK_SECRET=<your-client-secret>
KEYCLOAK_VERIFY_TOKEN_AUDIENCE=true
KEYCLOAK_ISSUER=https://your-keycloak.railway.app/realms/microdatacenter

# CORS (allow Vercel frontend)
CORS__ALLOWEDORIGINS__0=https://your-app.vercel.app
CORS__ALLOWEDORIGINS__1=https://*.vercel.app

# Migrations
API_RUN_DB_MIGRATIONS=true

# PVE (if needed)
PVE_BASE_URL=https://your-pve-mock.railway.app
PVE_AUTHENTICATION_SCHEME=ApiToken
PVE_VALIDATE_SERVER_CERTIFICATE=false
```

---

## Step 3: Deploy Keycloak

### Option A: Self-Host on Railway

1. Create a new service in Railway
2. Use the official Keycloak image: `quay.io/keycloak/keycloak:latest`
3. Configure environment variables:

```env
KEYCLOAK_ADMIN=admin
KEYCLOAK_ADMIN_PASSWORD=<secure-password>
KC_DB=postgres
KC_DB_URL=jdbc:postgresql://ep-xxx.neon.tech/keycloak_db?sslmode=require
KC_DB_USERNAME=<neon-user>
KC_DB_PASSWORD=<neon-password>
KC_HOSTNAME=your-keycloak.railway.app
KC_PROXY=edge
```

4. After deployment, configure:
   - Create realm: `microdatacenter`
   - Create client: `mdc-web` (public client)
   - Create client: `mdc-api` (confidential client)
   - Set Valid Redirect URIs: `https://your-app.vercel.app/*`
   - Set Web Origins: `https://your-app.vercel.app`

### Option B: Use Managed Auth (Alternative)

Consider these alternatives to self-hosted Keycloak:
- **Clerk** (https://clerk.com) - Easy integration with Next.js
- **Auth0** (https://auth0.com) - Enterprise-grade
- **Supabase Auth** (https://supabase.com) - If using Supabase

---

## Step 4: Deploy Frontend to Vercel

### Option A: Vercel CLI

```bash
cd /path/to/frontend

# Login to Vercel
npx vercel login

# Deploy preview
npm run deploy

# Deploy to production
npm run deploy:prod
```

### Option B: Vercel Dashboard

1. Go to https://vercel.com
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### Environment Variables for Frontend (Vercel)

Add these in Vercel Dashboard → Project Settings → Environment Variables:

| Variable | Value | Environment |
|----------|-------|-------------|
| `NEXT_PUBLIC_API_URL` | `https://mdc-api.railway.app` | Production |
| `NEXT_PUBLIC_KEYCLOAK_URL` | `https://mdc-auth.railway.app` | Production |
| `NEXT_PUBLIC_KEYCLOAK_REALM` | `microdatacenter` | All |
| `NEXT_PUBLIC_KEYCLOAK_CLIENT_ID` | `mdc-web` | All |

---

## Step 5: Configure DNS (Optional)

If using a custom domain:

1. In Vercel Dashboard → Domains → Add Domain
2. Add DNS records as instructed
3. Update Keycloak redirect URIs to include custom domain

---

## Deployment Commands Reference

```bash
# Frontend
npm run deploy        # Deploy preview
npm run deploy:prod   # Deploy production

# Build locally first
npm run build         # Test build locally

# Check deployment logs
npx vercel logs
```

---

## Post-Deployment Checklist

- [ ] Neon database created and connection tested
- [ ] Backend API deployed and healthy
- [ ] Keycloak deployed and configured
- [ ] Frontend deployed to Vercel
- [ ] Environment variables set correctly
- [ ] CORS configured on backend
- [ ] Keycloak redirect URIs updated
- [ ] SSL certificates active (automatic on Vercel/Railway)
- [ ] Test login flow end-to-end
- [ ] Test API calls from frontend

---

## Troubleshooting

### CORS Errors
- Verify `CORS__ALLOWEDORIGINS` includes your Vercel URL
- Check for trailing slashes in URLs

### Authentication Failures
- Verify Keycloak realm and client configuration
- Check `NEXT_PUBLIC_KEYCLOAK_URL` doesn't have trailing slash
- Ensure redirect URIs match exactly

### Database Connection Issues
- Verify Neon connection string includes `?sslmode=require`
- Check IP allowlist in Neon (should allow all for Railway)

### Build Failures on Vercel
- Check Node.js version (should be 18.x or 20.x)
- Verify all dependencies are in package.json
- Check for TypeScript errors: `npm run lint`

---

## Cost Estimates (Monthly)

| Service | Free Tier | Paid |
|---------|-----------|------|
| Vercel | 100GB bandwidth | $20/mo Pro |
| Railway | $5 credit | ~$10-20/mo |
| Neon | 0.5GB storage | $19/mo Pro |
| **Total** | ~$0-5/mo | ~$50-60/mo |

---

## Security Notes

- Never commit `.env.local` or secrets to Git
- Use Vercel's environment variable encryption
- Enable 2FA on all service accounts
- Rotate Keycloak client secrets periodically
- Set up monitoring and alerts

---

## Contact

For deployment assistance, contact the development team.
