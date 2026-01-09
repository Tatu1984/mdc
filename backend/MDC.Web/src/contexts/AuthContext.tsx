'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import keycloak, { initKeycloak, doLogin, doLogout, getUserRoles, hasRole, hasAnyRole, isLoggedIn, getToken } from '../config/keycloak';

interface UserInfo {
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  roles: string[];
  apiKey?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  username: string | undefined;
  userRoles: string[];
  userInfo: UserInfo | null;
  token: string | undefined;
  login: () => void;
  logout: () => void;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  refreshUserInfo: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [username, setUsername] = useState<string | undefined>(undefined);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [token, setToken] = useState<string | undefined>(undefined);

  const refreshUserInfo = async () => {
    if (isLoggedIn() && keycloak.tokenParsed) {
      const tokenParsed = keycloak.tokenParsed;
      const userInfo: UserInfo = {
        username: tokenParsed.preferred_username,
        email: tokenParsed.email,
        firstName: tokenParsed.given_name,
        lastName: tokenParsed.family_name,
        roles: getUserRoles(),
        apiKey: tokenParsed.api_key,
      };
      setUserInfo(userInfo);
      setUsername(tokenParsed.preferred_username);
      setUserRoles(getUserRoles());
      setToken(getToken());
    }
  };

  useEffect(() => {
    initKeycloak(() => {
      setIsAuthenticated(isLoggedIn());
      if (isLoggedIn()) {
        refreshUserInfo();
      }
      setIsLoading(false);
    });

    // Set up token refresh interval
    const interval = setInterval(() => {
      if (isLoggedIn()) {
        keycloak.updateToken(30).then((refreshed) => {
          if (refreshed) {
            refreshUserInfo();
          }
        }).catch(() => {
          setIsAuthenticated(false);
          setUsername(undefined);
          setUserRoles([]);
          setUserInfo(null);
          setToken(undefined);
        });
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const login = () => {
    doLogin();
  };

  const logout = () => {
    doLogout();
    setIsAuthenticated(false);
    setUsername(undefined);
    setUserRoles([]);
    setUserInfo(null);
    setToken(undefined);
  };

  const checkRole = (role: string) => {
    return hasRole(role);
  };

  const checkAnyRole = (roles: string[]) => {
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
    hasRole: checkRole,
    hasAnyRole: checkAnyRole,
    refreshUserInfo,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};