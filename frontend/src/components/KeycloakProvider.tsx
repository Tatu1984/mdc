'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode, useRef } from 'react';

/**
 * User information interface
 */
export interface UserInfo {
  id?: string;
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  roles: string[];
}

/**
 * Authentication context interface
 */
interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  user: UserInfo | null;
  token: string | null;
  login: () => void;
  loginPopup: () => Promise<void>;
  logout: () => void;
  logoutPopup: () => Promise<void>;
  hasRole: (role: string) => boolean;
  getAccessToken: () => Promise<string | null>;
}

// Default context value for SSR and initial render
const defaultAuthContext: AuthContextType = {
  isAuthenticated: false,
  isLoading: true,
  isInitialized: false,
  user: null,
  token: null,
  login: () => {},
  loginPopup: async () => {},
  logout: () => {},
  logoutPopup: async () => {},
  hasRole: () => false,
  getAccessToken: async () => null,
};

/**
 * Create authentication context with default value
 */
const AuthContext = createContext<AuthContextType>(defaultAuthContext);

/**
 * Keycloak Provider Component
 */
export const KeycloakProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [keycloakInstance, setKeycloakInstance] = useState<any>(null);
  const initRef = useRef(false);

  /**
   * Initialize Keycloak on component mount (client-side only)
   */
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    // Prevent double initialization in React Strict Mode
    if (initRef.current) return;
    initRef.current = true;

    const init = async () => {
      try {
        // Dynamic import to ensure client-side only
        const Keycloak = (await import('keycloak-js')).default;

        const keycloakConfig = {
          url: process.env.NEXT_PUBLIC_KEYCLOAK_URL || 'http://localhost:8090',
          realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM || 'microdatacenter',
          clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || 'mdc-web',
        };

        const kc = new Keycloak(keycloakConfig);
        setKeycloakInstance(kc);

        const authenticated = await kc.init({
          onLoad: 'check-sso',
          silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
          pkceMethod: 'S256',
          checkLoginIframe: false,
        });

        setIsAuthenticated(authenticated);

        if (authenticated && kc.tokenParsed) {
          const userInfo: UserInfo = {
            id: kc.tokenParsed.sub,
            username: kc.tokenParsed.preferred_username,
            email: kc.tokenParsed.email,
            firstName: kc.tokenParsed.given_name,
            lastName: kc.tokenParsed.family_name,
            name: `${kc.tokenParsed.given_name || ''} ${kc.tokenParsed.family_name || ''}`.trim() || kc.tokenParsed.preferred_username,
            roles: kc.tokenParsed.realm_access?.roles || [],
          };
          setUser(userInfo);
          setToken(kc.token || null);
        }
      } catch (error) {
        console.error('Failed to initialize Keycloak:', error);
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    init();
  }, []);

  // Set up token refresh interval
  useEffect(() => {
    if (!keycloakInstance || !isAuthenticated) return;

    const interval = setInterval(async () => {
      try {
        const refreshed = await keycloakInstance.updateToken(30);
        if (refreshed) {
          console.log('Token refreshed successfully');
          setToken(keycloakInstance.token || null);
        }
      } catch (error) {
        console.error('Failed to refresh token:', error);
        setIsAuthenticated(false);
        setUser(null);
        setToken(null);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [keycloakInstance, isAuthenticated]);

  /**
   * Login handler
   */
  const login = () => {
    if (keycloakInstance) {
      keycloakInstance.login();
    }
  };

  /**
   * Login popup handler (falls back to redirect for Keycloak)
   */
  const loginPopup = async () => {
    if (keycloakInstance) {
      keycloakInstance.login();
    }
  };

  /**
   * Logout handler
   */
  const logout = () => {
    if (keycloakInstance) {
      keycloakInstance.logout({ redirectUri: window.location.origin });
    }
    setIsAuthenticated(false);
    setUser(null);
    setToken(null);
  };

  /**
   * Logout popup handler
   */
  const logoutPopup = async () => {
    logout();
  };

  /**
   * Check if user has a specific role
   */
  const hasRole = (role: string): boolean => {
    return user?.roles?.includes(role) || false;
  };

  /**
   * Get access token for API calls
   */
  const getAccessToken = async (): Promise<string | null> => {
    if (!keycloakInstance || !isAuthenticated) return null;

    try {
      await keycloakInstance.updateToken(30);
      return keycloakInstance.token || null;
    } catch (error) {
      console.error('Failed to get access token:', error);
      return null;
    }
  };

  const value: AuthContextType = {
    isAuthenticated,
    isLoading,
    isInitialized,
    user,
    token,
    login,
    loginPopup,
    logout,
    logoutPopup,
    hasRole,
    getAccessToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Custom hook to use authentication context
 */
export const useKeycloakAuth = (): AuthContextType => {
  return useContext(AuthContext);
};

export default KeycloakProvider;
