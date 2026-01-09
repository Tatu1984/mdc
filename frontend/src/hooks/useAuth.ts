"use client";

import { useKeycloakAuth } from "@/components/KeycloakProvider";

export function useAuth() {
  const auth = useKeycloakAuth();

  return {
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    account: auth.user,
    user: auth.user ? {
      name: auth.user.name || auth.user.username,
      email: auth.user.email,
      id: auth.user.id,
    } : null,
    login: auth.login,
    loginPopup: auth.loginPopup,
    logout: auth.logout,
    logoutPopup: auth.logoutPopup,
    getAccessToken: auth.getAccessToken,
    hasRole: auth.hasRole,
  };
}
