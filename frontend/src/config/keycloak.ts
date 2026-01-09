import Keycloak from 'keycloak-js';

// Keycloak configuration
const keycloakConfig = {
  url: process.env.NEXT_PUBLIC_KEYCLOAK_URL || 'http://localhost:8090',
  realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM || 'microdatacenter',
  clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || 'mdc-web',
};

// Create Keycloak instance (only on client side)
let keycloak: Keycloak | null = null;

export const getKeycloakInstance = (): Keycloak => {
  if (typeof window === 'undefined') {
    throw new Error('Keycloak can only be used on the client side');
  }

  if (!keycloak) {
    keycloak = new Keycloak(keycloakConfig);
  }

  return keycloak;
};

/**
 * Initialize Keycloak with PKCE for enhanced security
 */
export const initKeycloak = async (onAuthenticatedCallback: () => void): Promise<boolean> => {
  const kc = getKeycloakInstance();

  try {
    const authenticated = await kc.init({
      onLoad: 'check-sso',
      silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
      pkceMethod: 'S256',
      checkLoginIframe: false,
    });

    if (authenticated) {
      onAuthenticatedCallback();
    }

    return authenticated;
  } catch (error) {
    console.error('Keycloak initialization failed:', error);
    return false;
  }
};

/**
 * Login user by redirecting to Keycloak
 */
export const doLogin = () => {
  const kc = getKeycloakInstance();
  kc.login();
};

/**
 * Login with popup (not natively supported, falls back to redirect)
 */
export const doLoginPopup = () => {
  const kc = getKeycloakInstance();
  kc.login();
};

/**
 * Logout user
 */
export const doLogout = () => {
  const kc = getKeycloakInstance();
  kc.logout({ redirectUri: window.location.origin });
};

/**
 * Check if user is logged in
 */
export const isLoggedIn = (): boolean => {
  const kc = getKeycloakInstance();
  return !!kc.token;
};

/**
 * Get current authentication token
 */
export const getToken = (): string | undefined => {
  const kc = getKeycloakInstance();
  return kc.token;
};

/**
 * Update token if it's about to expire
 */
export const updateToken = async (minValidity: number = 30): Promise<boolean> => {
  const kc = getKeycloakInstance();
  try {
    const refreshed = await kc.updateToken(minValidity);
    return refreshed;
  } catch (error) {
    console.error('Failed to refresh token:', error);
    return false;
  }
};

/**
 * Get username from token
 */
export const getUsername = (): string | undefined => {
  const kc = getKeycloakInstance();
  return kc.tokenParsed?.preferred_username;
};

/**
 * Get user email from token
 */
export const getEmail = (): string | undefined => {
  const kc = getKeycloakInstance();
  return kc.tokenParsed?.email;
};

/**
 * Get user's full name from token
 */
export const getFullName = (): string | undefined => {
  const kc = getKeycloakInstance();
  if (kc.tokenParsed) {
    const firstName = kc.tokenParsed.given_name || '';
    const lastName = kc.tokenParsed.family_name || '';
    return `${firstName} ${lastName}`.trim() || kc.tokenParsed.preferred_username;
  }
  return undefined;
};

/**
 * Get user roles from token
 */
export const getUserRoles = (): string[] => {
  const kc = getKeycloakInstance();
  if (kc.tokenParsed) {
    return kc.tokenParsed.realm_access?.roles || [];
  }
  return [];
};

/**
 * Check if user has a specific role
 */
export const hasRole = (role: string): boolean => {
  return getUserRoles().includes(role);
};

/**
 * Get user information from token
 */
export const getUserInfo = () => {
  const kc = getKeycloakInstance();
  if (kc.tokenParsed) {
    return {
      id: kc.tokenParsed.sub,
      username: kc.tokenParsed.preferred_username,
      email: kc.tokenParsed.email,
      firstName: kc.tokenParsed.given_name,
      lastName: kc.tokenParsed.family_name,
      name: getFullName(),
      roles: getUserRoles(),
    };
  }
  return null;
};

export default getKeycloakInstance;
