export const msalConfig = {
  auth: {
    clientId: "d06088e9-105e-444d-994b-553b3c22edd2",
    authority: "https://login.microsoftonline.com/bec87dfa-4b6f-4aa2-abfb-b124b91a462d",
    redirectUri: "http://localhost:3000",
  },
  cache: {
    cacheLocation: "localStorage", // or "sessionStorage"
    storeAuthStateInCookie: false,
  },
};