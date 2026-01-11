# MDC Deployment Guide

## Architecture
- **Frontend**: Vercel (Next.js)
- **Backend API**: Railway (.NET 9)
- **Auth**: Railway (Keycloak)
- **Database**: Neon (PostgreSQL)

---

## Step 1: Deploy Keycloak to Railway

### Option A: Via Railway Dashboard (Recommended)
1. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
2. Select this repo, set **Root Directory** to `backend/keycloak`
3. Add these environment variables:

```
KEYCLOAK_ADMIN=admin
KEYCLOAK_ADMIN_PASSWORD=<choose-a-strong-password>
```

4. After deploy, go to **Settings → Networking → Generate Domain**
5. Note down the URL (e.g., `https://keycloak-xxx.up.railway.app`)

### Configure Keycloak
1. Open the Keycloak URL → Admin Console → Login
2. Create realm: `microdatacenter`
3. Create client:
   - Client ID: `mdc-web`
   - Client type: `public`
   - Valid redirect URIs: `https://your-vercel-app.vercel.app/*`, `http://localhost:3000/*`
   - Web origins: `+`

---

## Step 2: Deploy Backend API to Railway

### Via Railway Dashboard
1. Go to Railway → New Project → Deploy from GitHub
2. Select this repo, set **Root Directory** to `backend`
3. Add these environment variables:

```
# Database (Neon)
ConnectionStrings__DefaultConnection=Host=ep-wild-term-ah4lcpbe-pooler.c-3.us-east-1.aws.neon.tech;Database=neondb;Username=neondb_owner;Password=npg_5TvwSzIP0pfR;SSL Mode=Require;Trust Server Certificate=true

# Migrations
API_RUN_DB_MIGRATIONS=true

# Keycloak Auth (replace with your Keycloak URL)
KEYCLOAK_AUTH_SERVER_URL=https://your-keycloak.up.railway.app
KEYCLOAK_REALM=microdatacenter
KEYCLOAK_RESOURCE=mdc-web
KEYCLOAK_ISSUER=https://your-keycloak.up.railway.app/realms/microdatacenter
KEYCLOAK_VERIFY_TOKEN_AUDIENCE=true

# API Keys (for testing without Keycloak)
API_KEYS_ENABLED=true

# CORS (replace with your Vercel URL)
CORS__AllowedOrigins__0=https://your-app.vercel.app
CORS__AllowedOrigins__1=http://localhost:3000

# PVE Mock (optional - for demo)
PVEClientService__BaseUrl=http://localhost:8006
PVEClientService__AuthenticationScheme=PVEAPIToken
PVEClientService__TokenId=root@pam!api
PVEClientService__Secret=demo-secret
PVEClientService__ValidateServerCertificate=false
PVEClientService__Timeout=30
```

4. After deploy, go to **Settings → Networking → Generate Domain**
5. Note down the URL (e.g., `https://mdc-api-xxx.up.railway.app`)

---

## Step 3: Deploy Frontend to Vercel

1. Import from GitHub at [vercel.com](https://vercel.com)
2. Set **Root Directory** to `frontend`
3. Add these environment variables:

```
NEXT_PUBLIC_API_URL=https://mdc-api-xxx.up.railway.app
NEXT_PUBLIC_KEYCLOAK_URL=https://keycloak-xxx.up.railway.app
NEXT_PUBLIC_KEYCLOAK_REALM=microdatacenter
NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=mdc-web
```

4. Deploy!

---

## Quick Test

After deployment, test the backend health:
```bash
curl https://your-backend-url.up.railway.app/health
```

Test API (using API key):
```bash
curl -H "X-API-Key: test-admin-key-12345" https://your-backend-url.up.railway.app/odata/datacenters
```

---

## Troubleshooting

### Backend won't start
- Check Railway logs for connection errors
- Verify Neon connection string is correct
- Ensure `API_RUN_DB_MIGRATIONS=true` for first deploy

### CORS errors
- Add your Vercel URL to `CORS__AllowedOrigins__0`
- Redeploy the backend after updating

### Keycloak login fails
- Verify realm name matches
- Check client redirect URIs include your frontend URL
