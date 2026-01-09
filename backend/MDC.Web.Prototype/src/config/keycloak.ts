import Keycloak from 'keycloak-js';

// Helper function to get environment variables (works in both server and client)
const env = (key: string): string | undefined => {
  if (typeof window === 'undefined') {
    // Server-side
    return process.env[key];
  } else {
    // Client-side - Next.js only exposes NEXT_PUBLIC_ prefixed vars
    return process.env[`NEXT_PUBLIC_${key}`];
  }
};

// Keycloak configuration
const keycloakConfig = {
  url: env('KEYCLOAK_URL') || 'http://localhost:8090',
  realm: env('KEYCLOAK_REALM') || 'microdatacenter',
  clientId: env('KEYCLOAK_CLIENT_ID') || 'mdc-web',
};

// Create Keycloak instance
const keycloak = new Keycloak(keycloakConfig);

/**
 * Initialize Keycloak with PKCE (Proof Key for Code Exchange) for enhanced security
 * @param onAuthenticatedCallback - Callback function to execute after successful authentication
 */
export const initKeycloak = (onAuthenticatedCallback: () => void) => {
  keycloak
    .init({
      onLoad: 'check-sso',
      silentCheckSsoRedirectUri:
        typeof window !== 'undefined'
          ? window.location.origin + '/silent-check-sso.html'
          : undefined,
      pkceMethod: 'S256',
      checkLoginIframe: false, // Disable for better performance
    })
    .then((authenticated) => {
      if (authenticated) {
        onAuthenticatedCallback();
      } else {
        console.log('User is not authenticated');
      }
    })
    .catch((error) => {
      console.error('Keycloak initialization failed:', error);
    });
};

/**
 * Login user by redirecting to Keycloak
 */
export const doLogin = () => keycloak.login();

/**
 * Logout user and redirect to Keycloak logout
 */
export const doLogout = () => keycloak.logout();

/**
 * Check if user is logged in
 */
export const isLoggedIn = () => !!keycloak.token;

/**
 * Get current authentication token
 */
export const getToken = () => keycloak.token;

/**
 * Update token if it's about to expire
 * @param minValidity - Minimum validity in seconds (default 30)
 */
export const updateToken = (minValidity: number = 30) =>
  keycloak.updateToken(minValidity);

/**
 * Get username from token
 */
export const getUsername = () => keycloak.tokenParsed?.preferred_username;

/**
 * Get user roles from token
 */
export const getUserRoles = (): string[] => {
  if (keycloak.tokenParsed) {
    return keycloak.tokenParsed.realm_access?.roles || [];
  }
  return [];
};

/**
 * Check if user has a specific role
 * @param role - Role to check
 */
export const hasRole = (role: string): boolean => {
  return getUserRoles().includes(role);
};

/**
 * Check if user has any of the specified roles
 * @param roles - Array of roles to check
 */
export const hasAnyRole = (roles: string[]): boolean => {
  const userRoles = getUserRoles();
  return roles.some((role) => userRoles.includes(role));
};

/**
 * Get user information from token
 */
export const getUserInfo = () => {
  if (keycloak.tokenParsed) {
    return {
      username: keycloak.tokenParsed.preferred_username,
      email: keycloak.tokenParsed.email,
      firstName: keycloak.tokenParsed.given_name,
      lastName: keycloak.tokenParsed.family_name,
      roles: getUserRoles(),
      apiKey: keycloak.tokenParsed.api_key,
    };
  }
  return null;
};

export default keycloak;
