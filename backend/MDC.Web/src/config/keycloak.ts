import Keycloak from 'keycloak-js';
import { env } from 'next-runtime-env';

const keycloakConfig = {
  url: env('KEYCLOAK_URL') || '/keycloak',
  realm: env('KEYCLOAK_REALM') || 'microdatacenter',
  clientId: env('KEYCLOAK_CLIENT_ID') || 'mdc-web',
};

const keycloak = new Keycloak(keycloakConfig);

export default keycloak;

export const initKeycloak = (onAuthenticatedCallback: () => void) => {
  keycloak
    .init({
      onLoad: 'check-sso',
      silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
      pkceMethod: 'S256',
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

export const doLogin = () => {
  keycloak.login();
};

export const doLogout = () => {
  keycloak.logout();
};

export const getToken = () => keycloak.token;

export const isLoggedIn = () => !!keycloak.token;

export const updateToken = (successCallback: () => void) => {
  return keycloak.updateToken(5)
    .then(successCallback)
    .catch(doLogin);
};

export const getUsername = () => keycloak.tokenParsed?.preferred_username;

export const getUserRoles = () => {
  if (keycloak.tokenParsed) {
    return keycloak.tokenParsed.realm_access?.roles || [];
  }
  return [];
};

export const hasRole = (role: string) => {
  const roles = getUserRoles();
  return roles.includes(role);
};

export const hasAnyRole = (roles: string[]) => {
  const userRoles = getUserRoles();
  return roles.some(role => userRoles.includes(role));
};