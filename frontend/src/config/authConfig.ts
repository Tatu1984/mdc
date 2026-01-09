import { Configuration, LogLevel } from "@azure/msal-browser";
import { env } from "./env";

/**
 * Get MSAL Configuration for Azure AD authentication
 * Uses runtime env for container deployments
 */
export const getMsalConfig = (): Configuration => ({
  auth: {
    clientId: env.MSAL_CLIENT_ID,
    authority: env.MSAL_AUTHORITY,
    redirectUri: env.MSAL_REDIRECT_URI,
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) {
          return;
        }
        switch (level) {
          case LogLevel.Error:
            console.error(message);
            return;
          case LogLevel.Info:
            console.info(message);
            return;
          case LogLevel.Verbose:
            console.debug(message);
            return;
          case LogLevel.Warning:
            console.warn(message);
            return;
        }
      },
      logLevel: LogLevel.Warning,
    },
  },
});

// For backwards compatibility, evaluate once when module loads
// Note: For container deployments, use getMsalConfig() instead
export const msalConfig: Configuration = getMsalConfig();

/**
 * Scopes for login (basic user info)
 */
export const loginRequest = {
  scopes: ["User.Read"],
};

/**
 * Get API request scopes (evaluated at runtime for container deployments)
 */
export const getApiRequest = () => ({
  scopes: [env.API_SCOPE || "api://5994d2e3-7ca3-4f42-9032-b01727b04508/access_as_user"],
});

// For backwards compatibility
export const apiRequest = {
  get scopes() {
    return [env.API_SCOPE || "api://5994d2e3-7ca3-4f42-9032-b01727b04508/access_as_user"];
  }
};
