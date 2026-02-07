const jose = require('jose');

const JWKS_URL = (tenant) =>
  `https://login.microsoftonline.com/${tenant}/discovery/v2.0/keys`;

async function getOidFromToken(authHeader, clientId, tenantId = 'common') {
  const claims = await getClaimsFromToken(authHeader, clientId, tenantId);
  return claims ? claims.oid : null;
}

async function getClaimsFromToken(authHeader, clientId, tenantId = 'common') {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.slice(7);
  try {
    const jwks = jose.createRemoteJWKSet(new URL(JWKS_URL(tenantId)));
    const { payload } = await jose.jwtVerify(token, jwks, {
      audience: clientId,
    });
    const oid = payload.oid || payload.sub || null;
    if (!oid) return null;
    return {
      oid,
      name: payload.name || payload.preferred_username || '',
      email: payload.email || payload.preferred_username || '',
    };
  } catch (err) {
    console.error('JWT validation failed:', err.message);
    return null;
  }
}

module.exports = { getOidFromToken, getClaimsFromToken };
