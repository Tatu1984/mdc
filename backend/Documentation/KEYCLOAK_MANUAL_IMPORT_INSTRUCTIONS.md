# Manual Keycloak Realm Import Instructions

This guide shows how to manually import the MicroDataCenter realm configuration into Keycloak using the admin interface.

## 📁 Files Included

- **`microdatacenter-realm.json`** - Complete realm export file with all configurations

## 🚀 Import Steps

### 1. Access Keycloak Admin Console
1. Make sure Keycloak is running: `docker-compose up mdc-db mdc-auth -d`
2. Open your browser and go to: `http://localhost:8090/admin/`
3. Login with admin credentials:
   - **Username**: `admin`
   - **Password**: `keycloak_admin_secure_2024`

### 2. Import the Realm
1. In the Keycloak admin console, look at the left sidebar
2. At the top of the sidebar, you'll see a dropdown that says "Master" (or current realm name)
3. Click on this dropdown
4. Click **"Create Realm"** at the bottom of the dropdown
5. In the Create Realm page, you'll see two options:
   - **Create realm** (manual setup)
   - **Import** (import from file)
6. Click **"Browse..."** next to the Resource file field
7. Select the `microdatacenter-realm.json` file from your project directory
8. Click **"Create"**

### 3. Verify Import Success
After import, you should see:
- ✅ Realm name: `microdatacenter`
- ✅ 4 roles created (GlobalAdministrator, DatacenterTechnician, WorkspaceManager, WorkspaceTenant)
- ✅ 2 clients created (mdc-web, mdc-api)
- ✅ 1 admin user created with all roles
- ✅ Proper protocol mappers for tokens

## 🔐 What Gets Imported

### Realm Configuration
- **Name**: `microdatacenter`
- **Display Name**: MicroDataCenter
- **Token Lifespan**: 1 hour
- **Session Settings**: Optimized for web apps
- **Security**: Proper CORS and security headers

### Roles
- **GlobalAdministrator** - Full system access across all datacenters
- **DatacenterTechnician** - Can manage datacenter infrastructure and resources
- **WorkspaceManager** - Can manage workspaces and their resources
- **WorkspaceTenant** - Can use workspace resources but not manage them

### Clients

#### Web Client (`mdc-web`)
- **Type**: Public client for React/Next.js
- **Client ID**: `mdc-web`
- **Client Secret**: `mdc-web-client-secret-2024`
- **Redirect URIs**: 
  - `http://localhost:3000/*`
  - `http://mdc-web:3000/*`
- **Features**: OIDC, PKCE enabled, role mapping

#### API Client (`mdc-api`)
- **Type**: Confidential client for backend
- **Client ID**: `mdc-api`
- **Client Secret**: `mdc-api-client-secret-2024`
- **Features**: Bearer token validation, service accounts

### Admin User
- **Username**: `admin`
- **Password**: `keycloak_admin_secure_2024` ⚠️ **Change in production!**
- **Email**: `admin@microdatacenter.local`
- **Roles**: All roles assigned
- **API Key**: `mdc_api_key_admin_2024` (stored as user attribute)

### Token Claims
JWT tokens will include:
- `preferred_username` - Username
- `email` - User email address
- `realm_access.roles` - Array of user roles
- `api_key` - User's API key
- `given_name` / `family_name` - First/Last name
- `department` - User department
- `organization` - User organization

## 🧪 Testing After Import

### 1. Test Admin Login to Realm
```bash
curl -X POST "http://localhost:8090/realms/microdatacenter/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin" \
  -d "password=keycloak_admin_secure_2024" \
  -d "grant_type=password" \
  -d "client_id=mdc-web"
```

### 2. Verify Token Contains Expected Claims
The response should include an `access_token`. You can decode it at [jwt.io](https://jwt.io) to verify it contains:
- ✅ `realm_access.roles`: ["GlobalAdministrator", "DatacenterTechnician", "WorkspaceManager", "WorkspaceTenant"]
- ✅ `api_key`: "mdc_api_key_admin_2024"
- ✅ `preferred_username`: "admin"
- ✅ `email`: "admin@microdatacenter.local"

### 3. Test Web Application Login
Your React/Next.js app should be able to authenticate using:
```typescript
const keycloakConfig = {
  url: 'http://localhost:8090',
  realm: 'microdatacenter',
  clientId: 'mdc-web',
};
```

## 🔧 Configuration Details

### Environment Variables
After import, update your `.env` file to match:
```bash
# Keycloak Authentication Configuration
KEYCLOAK_REALM=microdatacenter
KEYCLOAK_AUTH_SERVER_URL=http://localhost:8090
KEYCLOAK_RESOURCE=mdc-api
KEYCLOAK_SECRET=mdc-api-client-secret-2024
KEYCLOAK_VERIFY_TOKEN_AUDIENCE=true

# MicroDataCenter Admin User Configuration  
MDC_ADMIN_USER=admin
MDC_ADMIN_PASSWORD=keycloak_admin_secure_2024
MDC_ADMIN_EMAIL=admin@microdatacenter.local
MDC_API_KEY=mdc_api_key_admin_2024
```

### Client Secrets
- **Web Client Secret**: `mdc-web-client-secret-2024`
- **API Client Secret**: `mdc-api-client-secret-2024`

⚠️ **Important**: Change all default passwords and secrets before production use!

## 🔄 Re-importing / Updates

If you need to re-import or update the realm:

### Option 1: Delete and Re-import
1. Go to Realm Settings → General
2. Click **"Delete"** to remove the realm
3. Follow the import steps above with the updated file

### Option 2: Partial Updates
For small changes, you can:
1. Export the current realm as backup
2. Make manual changes in the admin console
3. Export again if you want to save the changes

## ❓ Troubleshooting

### Import Fails
- **File not found**: Make sure `microdatacenter-realm.json` is in the correct directory
- **JSON errors**: Verify the file wasn't corrupted during download/transfer
- **Permission errors**: Make sure you're logged in as Keycloak admin

### Missing Features After Import
- **No users**: The admin user should be created automatically
- **Missing roles**: Check the Roles section in the admin console
- **Client issues**: Verify both `mdc-web` and `mdc-api` clients exist

### Authentication Issues
- **Wrong URL**: Make sure you're using `microdatacenter` realm, not `master`
- **Wrong credentials**: Default password is `keycloak_admin_secure_2024`
- **Client not found**: Verify client IDs match your application configuration

## 🎯 Next Steps

After successful import:
1. ✅ Test user authentication
2. ✅ Verify token claims
3. ✅ Update application configurations
4. ✅ Change default passwords for production
5. ✅ Test your web application login flow
6. ✅ Test API authentication with tokens

The realm is now ready for integration with your MicroDataCenter applications!