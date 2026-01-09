#!/bin/sh
# Docker entrypoint script
# Generates runtime environment configuration from environment variables

# Create env-config.js with actual environment values
cat > /app/public/env-config.js << EOF
// Runtime environment configuration - Generated at container startup
window.__ENV__ = {
  NEXT_PUBLIC_API_URL: "${NEXT_PUBLIC_API_URL:-}",
  NEXT_PUBLIC_MSAL_CLIENT_ID: "${NEXT_PUBLIC_MSAL_CLIENT_ID:-}",
  NEXT_PUBLIC_MSAL_AUTHORITY: "${NEXT_PUBLIC_MSAL_AUTHORITY:-}",
  NEXT_PUBLIC_MSAL_REDIRECT_URI: "${NEXT_PUBLIC_MSAL_REDIRECT_URI:-}",
  NEXT_PUBLIC_API_SCOPE: "${NEXT_PUBLIC_API_SCOPE:-}"
};
EOF

echo "Runtime environment configuration generated:"
cat /app/public/env-config.js

# Start the Next.js server
exec node server.js
