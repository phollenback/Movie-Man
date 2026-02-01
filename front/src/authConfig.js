// Microsoft Entra (Azure AD) configuration for Movie-Man
// Values come from REACT_APP_* env vars at build time (Docker) or .env.local (local dev)

export const msalConfig = {
  auth: {
    clientId: process.env.REACT_APP_ENTRA_CLIENT_ID || '',
    authority: `https://login.microsoftonline.com/${process.env.REACT_APP_ENTRA_TENANT_ID || 'common'}`,
    redirectUri: process.env.REACT_APP_REDIRECT_URI || window.location.origin,
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  },
};

export const loginRequest = {
  scopes: ['User.Read', 'openid', 'profile'],
};
