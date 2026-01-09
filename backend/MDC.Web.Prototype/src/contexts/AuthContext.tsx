'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  initKeycloak,
  doLogin,
  doLogout,
  isLoggedIn,
  getToken,
  getUserRoles,
  hasRole,
  hasAnyRole,
  updateToken,
  getUserInfo,
} from '@/config/keycloak';

/**
 * User information interface
 */
export interface UserInfo {
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  roles: string[];
  apiKey?: string;
}

/**
 * Authentication context interface
 */
interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  username: string | null;
  userRoles: string[];
  userInfo: UserInfo | null;
  token: string | null;
  login: () => void;
  logout: () => void;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  refreshUserInfo: () => void;
}

/**
 * Create authentication context
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Authentication Provider Component
 * Manages global authentication state and provides auth methods to the application
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [username, setUsername] = useState<string | null>(null);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [token, setToken] = useState<string | null>(null);

  /**
   * Refresh user information from token
   */
  const refreshUserInfo = () => {
    const info = getUserInfo();
    if (info) {
      setUsername(info.username || null);
      setUserRoles(info.roles);
      setUserInfo(info);
    }
    setToken(getToken() || null);
  };

  /**
   * Initialize Keycloak on component mount
   */
  useEffect(() => {
    initKeycloak(() => {
      setIsAuthenticated(isLoggedIn());
      if (isLoggedIn()) {
        refreshUserInfo();
      }
      setIsLoading(false);
    });

    // Set up token refresh interval (every 30 seconds)
    const interval = setInterval(() => {
      if (isLoggedIn()) {
        updateToken(30)
          .then((refreshed) => {
            if (refreshed) {
              console.log('Token refreshed successfully');
              refreshUserInfo();
            }
          })
          .catch((error) => {
            console.error('Failed to refresh token:', error);
            setIsAuthenticated(false);
            setUsername(null);
            setUserRoles([]);
            setUserInfo(null);
            setToken(null);
          });
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

  /**
   * Login handler
   */
  const login = () => {
    doLogin();
  };

  /**
   * Logout handler
   */
  const logout = () => {
    doLogout();
    setIsAuthenticated(false);
    setUsername(null);
    setUserRoles([]);
    setUserInfo(null);
    setToken(null);
  };

  /**
   * Check if user has a specific role
   */
  const checkHasRole = (role: string): boolean => {
    return hasRole(role);
  };

  /**
   * Check if user has any of the specified roles
   */
  const checkHasAnyRole = (roles: string[]): boolean => {
    return hasAnyRole(roles);
  };

  const value: AuthContextType = {
    isAuthenticated,
    isLoading,
    username,
    userRoles,
    userInfo,
    token,
    login,
    logout,
    hasRole: checkHasRole,
    hasAnyRole: checkHasAnyRole,
    refreshUserInfo,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Custom hook to use authentication context
 * @throws Error if used outside of AuthProvider
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
