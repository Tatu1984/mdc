#!/bin/bash

KEYCLOAK_URL="http://localhost:8090"
ADMIN_USER="admin"
ADMIN_PASSWORD="keycloak_admin_secure_2024"
REALM="microdatacenter"
CLIENT_ID="mdc-web"
API_CLIENT_ID="mdc-api"

# Wait for Keycloak to be ready
echo "Waiting for Keycloak to be ready..."
until curl -s "$KEYCLOAK_URL/health/ready" > /dev/null 2>&1; do
    sleep 2
done
echo "Keycloak is ready!"

# Get admin token
echo "Getting admin token..."
TOKEN=$(curl -s -X POST "$KEYCLOAK_URL/realms/master/protocol/openid-connect/token" \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "username=$ADMIN_USER" \
    -d "password=$ADMIN_PASSWORD" \
    -d "grant_type=password" \
    -d "client_id=admin-cli" | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo "Failed to get admin token"
    exit 1
fi
echo "Got admin token!"

# Check if realm exists
REALM_EXISTS=$(curl -s -o /dev/null -w "%{http_code}" "$KEYCLOAK_URL/admin/realms/$REALM" \
    -H "Authorization: Bearer $TOKEN")

if [ "$REALM_EXISTS" == "200" ]; then
    echo "Realm $REALM already exists"
else
    # Create realm
    echo "Creating realm $REALM..."
    curl -s -X POST "$KEYCLOAK_URL/admin/realms" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d '{
            "realm": "'$REALM'",
            "enabled": true,
            "registrationAllowed": false,
            "loginWithEmailAllowed": true,
            "duplicateEmailsAllowed": false,
            "resetPasswordAllowed": true,
            "editUsernameAllowed": false,
            "bruteForceProtected": true
        }'
    echo "Realm created!"
fi

# Create web client
echo "Creating web client $CLIENT_ID..."
curl -s -X POST "$KEYCLOAK_URL/admin/realms/$REALM/clients" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
        "clientId": "'$CLIENT_ID'",
        "enabled": true,
        "publicClient": true,
        "directAccessGrantsEnabled": true,
        "standardFlowEnabled": true,
        "implicitFlowEnabled": false,
        "redirectUris": ["http://localhost:3000/*", "http://localhost:3001/*", "http://localhost:3002/*"],
        "webOrigins": ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"],
        "protocol": "openid-connect"
    }'
echo "Web client created!"

# Create API client
echo "Creating API client $API_CLIENT_ID..."
curl -s -X POST "$KEYCLOAK_URL/admin/realms/$REALM/clients" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
        "clientId": "'$API_CLIENT_ID'",
        "enabled": true,
        "publicClient": false,
        "serviceAccountsEnabled": true,
        "directAccessGrantsEnabled": true,
        "secret": "mdc-api-client-secret-2024"
    }'
echo "API client created!"

# Create admin user
echo "Creating test user..."
curl -s -X POST "$KEYCLOAK_URL/admin/realms/$REALM/users" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
        "username": "admin",
        "email": "admin@microdatacenter.local",
        "firstName": "Admin",
        "lastName": "User",
        "enabled": true,
        "emailVerified": true,
        "credentials": [{
            "type": "password",
            "value": "admin123",
            "temporary": false
        }]
    }'
echo "Test user created!"

echo ""
echo "========================================="
echo "Keycloak setup complete!"
echo "========================================="
echo "Keycloak URL: $KEYCLOAK_URL"
echo "Realm: $REALM"
echo "Client ID: $CLIENT_ID"
echo ""
echo "Test User Credentials:"
echo "  Username: admin"
echo "  Password: admin123"
echo "========================================="
