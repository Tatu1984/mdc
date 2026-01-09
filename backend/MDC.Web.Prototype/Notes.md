# MDC.Web.Prototype Authentication Testing Guide

## Overview

This document provides complete instructions for starting Keycloak and testing authentication in the MDC.Web.Prototype application.

## Architecture

- **Authentication Provider**: Keycloak 23.0
- **Protocol**: OAuth 2.0 / OpenID Connect with PKCE (S256)
- **Client Type**: Public client (browser-based)
- **Realm**: `microdatacenter`
- **Client ID**: `mdc-web`

## Prerequisites

- Docker and Docker Compose installed
- Node.js and npm installed
- Port 8090 available for Keycloak
- Port 3000 available for web app
- Port 5432 available for PostgreSQL

---

## Step 1: Start Keycloak with Docker Compose

```bash
# Navigate to the MDC project root (not the prototype folder)
cd /Users/roydevelops/Desktop/Dev/Companies/Infiniti/MDC

# Start Keycloak and database
docker-compose up -d mdc-db mdc-auth

# Check if services are running
docker-compose ps

# Expected output:
# NAME                COMMAND                  SERVICE    STATUS
# mdc-auth            "/opt/keycloak/bin/k…"   mdc-auth   Up
# mdc-db              "docker-entrypoint.s…"   mdc-db     Up (healthy)
```

**Wait 30-60 seconds** for Keycloak to fully initialize.

### Verify Keycloak is Running

```bash
# Check Keycloak logs
docker-compose logs -f mdc-auth

# Look for: "Keycloak 23.0 started in XXXms"
```

Or visit: **http://localhost:8090**

---

## Step 2: Configure Keycloak

### 2.1 Access Keycloak Admin Console

1. Navigate to: http://localhost:8090/admin
2. Login with:
   - Username: `admin`
   - Password: `keycloak_admin_secure_2024`

### 2.2 Create the Realm

1. Click the realm dropdown (top-left, currently shows "master")
2. Click **"Create Realm"**
3. **Realm name**: `microdatacenter`
4. **Enabled**: ON
5. Click **"Create"**

### 2.3 Create the Web Client

1. Make sure you're in the `microdatacenter` realm (check dropdown top-left)
2. Go to **"Clients"** in the left sidebar
3. Click **"Create client"**

**General Settings:**
- **Client type**: OpenID Connect
- **Client ID**: `mdc-web`
- Click **"Next"**

**Capability config:**
- **Client authentication**: OFF (This is important - it's a public client)
- **Authorization**: OFF
- **Authentication flow**:
  - Standard flow: **ON**
  - Direct access grants: **ON**
- Click **"Next"**

**Login settings:**
- **Root URL**: `http://localhost:3000`
- **Home URL**: `http://localhost:3000`
- **Valid redirect URIs**: `http://localhost:3000/*`
- **Valid post logout redirect URIs**: `http://localhost:3000/*`
- **Web origins**: `http://localhost:3000` or `+`
- Click **"Save"**

### 2.4 Create Realm Roles

1. Go to **"Realm roles"** (left sidebar)
2. Click **"Create role"** for each of these:
   - `GLOBAL_ADMINISTRATOR`
   - `DATACENTER_TECHNICIAN`
   - `WORKSPACE_MANAGER`
   - `WORKSPACE_TENANT`

### 2.5 Create Test User

1. Go to **"Users"** (left sidebar)
2. Click **"Add user"**
3. Fill in:
   - **Username**: `testuser`
   - **Email**: `testuser@example.com`
   - **First name**: `Test`
   - **Last name**: `User`
   - **Email verified**: ON
4. Click **"Create"**

**Set Password:**
1. Go to **"Credentials"** tab
2. Click **"Set password"**
3. **Password**: `password123`
4. **Password confirmation**: `password123`
5. **Temporary**: OFF
6. Click **"Save"** and confirm

**Assign Roles:**
1. Go to **"Role mapping"** tab
2. Click **"Assign role"**
3. Find and select: `WORKSPACE_TENANT`
4. Click **"Assign"**

---

## Step 3: Start the Web Application

```bash
# Navigate to the web prototype folder
cd /Users/roydevelops/Desktop/Dev/Companies/Infiniti/MDC/MDC.Web.Prototype

# Verify environment variables
cat .env.local

# Should have:
# NEXT_PUBLIC_KEYCLOAK_URL=http://localhost:8090
# NEXT_PUBLIC_KEYCLOAK_REALM=microdatacenter
# NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=mdc-web
# NEXT_PUBLIC_API_URL=https://localhost:8081

# Install dependencies (if not done)
npm install

# Start the development server
npm run dev
```

---

## Step 4: Test Authentication

### 4.1 Test Login Flow

1. **Open browser**: http://localhost:3000
2. You should be redirected to `/login` page
3. **Click "Sign In"** button
4. **Keycloak login page** should appear
5. **Enter credentials**:
   - Username: `testuser`
   - Password: `password123`
6. **Click "Sign In"**
7. You should be redirected back to the dashboard at `http://localhost:3000`

### 4.2 Verify Authentication

**Check UI:**
- Navigation bar (top-right) should show user name and email
- Click user menu → should see "Profile" and "Logout" options
- You should have access to the dashboard

**Check Browser Console (F12):**

```javascript
// Check authentication status
console.log("Authenticated:", window.keycloak?.authenticated);

// View user info
console.log("User:", window.keycloak?.tokenParsed);

// View roles
console.log("Roles:", window.keycloak?.realmAccess?.roles);
```

**Expected output:**
```
Authenticated: true
User: {
  sub: "...",
  email: "testuser@example.com",
  preferred_username: "testuser",
  given_name: "Test",
  family_name: "User"
}
Roles: ["WORKSPACE_TENANT", "default-roles-microdatacenter"]
```

### 4.3 Test Token Management

The app automatically refreshes tokens every 30 seconds. To verify:

1. Login and note the token value in console
2. Wait 30-60 seconds
3. Check token value again - it should be different
4. Check console for refresh logs

### 4.4 Test Protected Routes

Try accessing different pages:
- `/user` - User profile page (requires `WORKSPACE_TENANT` role)
- `/workspace` - Workspace management
- `/data-center` - Data center views

### 4.5 Test Logout

1. Click user menu (top-right)
2. Click **"Logout"**
3. Should redirect to Keycloak logout
4. Then redirect back to `/login`
5. Try accessing `http://localhost:3000` → should redirect to login

---

## Testing Checklist

**Initial Setup:**
- [ ] Keycloak server is running on port 8090
- [ ] PostgreSQL database is running
- [ ] Environment variables are configured
- [ ] Realm `microdatacenter` is created
- [ ] Client `mdc-web` is configured
- [ ] Test users exist with appropriate roles

**Login Flow:**
- [ ] Navigate to `http://localhost:3000`
- [ ] Redirects to `/login` when not authenticated
- [ ] "Sign In" button redirects to Keycloak
- [ ] Can login with valid credentials
- [ ] Redirects back to app after successful login
- [ ] No console errors during login

**Authentication State:**
- [ ] Navigation shows user name and email
- [ ] User menu displays correct information
- [ ] Can access `/user` profile page
- [ ] Browser console shows valid token

**Token Management:**
- [ ] Token automatically refreshes (check console after 30-60s)
- [ ] API calls include Authorization header (check Network tab)
- [ ] Token remains valid during navigation

**Role-Based Access:**
- [ ] User roles display correctly in profile
- [ ] Protected routes enforce role requirements
- [ ] Users without required roles see "Access Denied"

**Logout Flow:**
- [ ] Logout button in user menu works
- [ ] Redirects to Keycloak logout
- [ ] Session is terminated completely
- [ ] Cannot access protected routes after logout

**Silent SSO:**
- [ ] Opening new tab maintains session
- [ ] No re-login required in new tabs

---

## Common Issues & Solutions

### Issue: Keycloak won't start

```bash
# Check logs
docker-compose logs mdc-auth

# Common causes:
# - Database not ready
# - Port 8090 already in use
# - Database connection issues

# Restart services
docker-compose restart mdc-db mdc-auth
```

### Issue: Page Not Found from Keycloak

**Cause**: Realm or client doesn't exist

**Solution**:
1. Verify realm `microdatacenter` exists
2. Verify client `mdc-web` is configured with correct redirect URIs
3. Check URL in browser matches: `http://localhost:8090/realms/microdatacenter/...`

### Issue: Can't connect to Keycloak

```bash
# Verify Keycloak is accessible
curl http://localhost:8090/realms/microdatacenter/.well-known/openid-configuration

# Should return JSON configuration
# If 404, realm doesn't exist
```

### Issue: Redirect loop on login

**Solution**:
- Check client redirect URIs include `http://localhost:3000/*`
- Check `.env.local` has correct Keycloak URL
- Clear browser cache and cookies

### Issue: Token errors

**Solution**:
- Check realm name is `microdatacenter`
- Check client ID is `mdc-web`
- Verify client authentication is OFF (public client)
- Clear browser cache and cookies

### Issue: CORS errors

**Solution**:
- Verify Web origins in Keycloak client settings includes `http://localhost:3000`
- Check API CORS configuration allows `http://localhost:3000`

---

## Important Credentials

### Keycloak Admin
- URL: http://localhost:8090/admin
- Username: `admin`
- Password: `keycloak_admin_secure_2024`

### Test User
- Username: `testuser`
- Password: `password123`
- Role: `WORKSPACE_TENANT`

### Environment Variables
Located in: `/Users/roydevelops/Desktop/Dev/Companies/Infiniti/MDC/MDC.Web.Prototype/.env.local`

```env
NEXT_PUBLIC_KEYCLOAK_URL=http://localhost:8090
NEXT_PUBLIC_KEYCLOAK_REALM=microdatacenter
NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=mdc-web
NEXT_PUBLIC_API_URL=https://localhost:8081
```

---

## Quick Commands Reference

```bash
# Start Keycloak
cd /Users/roydevelops/Desktop/Dev/Companies/Infiniti/MDC
docker-compose up -d mdc-db mdc-auth

# Check Keycloak status
docker-compose ps
docker-compose logs mdc-auth

# Start Web App
cd MDC.Web.Prototype
npm run dev

# Verify realm configuration
curl http://localhost:8090/realms/microdatacenter/.well-known/openid-configuration

# Stop Keycloak when done
cd /Users/roydevelops/Desktop/Dev/Companies/Infiniti/MDC
docker-compose down

# Stop Keycloak but keep data
docker-compose stop mdc-auth mdc-db
```

---

## Authentication Architecture Details

### Key Files

1. **Keycloak Configuration**: `src/config/keycloak.ts`
   - Initializes Keycloak client
   - Manages tokens and user info
   - Provides auth utility functions

2. **Auth Context**: `src/contexts/AuthContext.tsx`
   - React Context for global auth state
   - Automatic token refresh (30s interval)
   - Provides `useAuth()` hook

3. **API Client**: `src/services/apiClient.ts`
   - Authenticated HTTP client
   - Automatic token injection
   - Token refresh before API calls

4. **Protected Route**: `src/components/ProtectedRoute.tsx`
   - Route protection component
   - Role-based access control
   - Loading states

5. **Login Page**: `src/app/login/page.tsx`
   - User-facing login interface
   - Redirects authenticated users

6. **User Profile**: `src/app/user/page.tsx`
   - User account management
   - API key management
   - Security settings

### Security Features

- **PKCE Flow**: S256 SHA256 challenge method
- **Silent SSO**: Seamless session detection
- **In-Memory Tokens**: Not stored in localStorage
- **Automatic Token Refresh**: 30-second interval
- **Role-Based Access Control**: Route and feature gating
- **Bearer Token Authentication**: Standard OAuth 2.0

### User Roles

- `GLOBAL_ADMINISTRATOR` - Full system access
- `DATACENTER_TECHNICIAN` - Manage datacenter infrastructure
- `WORKSPACE_MANAGER` - Create and manage workspaces
- `WORKSPACE_TENANT` - Access assigned workspaces

---

## Next Steps

1. **Create additional test users** with different roles to test RBAC
2. **Test role-based access** to different pages
3. **Set up API authentication** by starting the mdc-api service
4. **Configure production Keycloak** settings when deploying
5. **Add automated tests** for authentication flows

---

## Related Documentation

- Keycloak Documentation: https://www.keycloak.org/documentation
- OAuth 2.0 PKCE: https://oauth.net/2/pkce/
- Next.js Authentication: https://nextjs.org/docs/authentication
- keycloak-js Library: https://www.npmjs.com/package/keycloak-js

---

**Last Updated**: 2025-10-20
**Status**: Authentication working correctly ✓
