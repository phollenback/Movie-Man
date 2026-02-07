const { getClaimsFromToken, getOidFromToken } = require('../src/shared/auth');
const { getTableClient } = require('../src/shared/table');

module.exports = async function (context, req) {
  const method = (req.method || '').toUpperCase();
  const authHeader = req.headers?.authorization;
  const clientId = process.env.ENTRA_CLIENT_ID;
  const tenantId = process.env.ENTRA_TENANT_ID || 'common';

  if (method === 'POST') {
    const claims = await getClaimsFromToken(authHeader, clientId, tenantId);
    if (!claims) {
      context.res = { status: 401, body: { error: 'Unauthorized' } };
      return;
    }
    const table = getTableClient('Users');
    try {
      const now = new Date().toISOString();
      await table.upsertEntity({
        partitionKey: 'user',
        rowKey: claims.oid,
        displayName: claims.name || 'Unknown',
        email: claims.email || '',
        lastSeenAt: now,
      });
      context.res = { status: 201, body: { ok: true } };
    } catch (err) {
      context.log.error(err);
      context.res = { status: 500, body: { error: err.message } };
    }
    return;
  }

  if (method === 'GET') {
    const oid = await getOidFromToken(authHeader, clientId, tenantId);
    if (!oid) {
      context.res = { status: 401, body: { error: 'Unauthorized' } };
      return;
    }
    const table = getTableClient('Users');
    try {
      const users = [];
      const iter = table.listEntities({ queryOptions: { filter: "PartitionKey eq 'user'" } });
      for await (const e of iter) {
        users.push({
          oid: e.rowKey,
          displayName: e.displayName || 'Unknown',
          email: e.email || '',
          lastSeenAt: e.lastSeenAt || '',
        });
      }
      users.sort((a, b) => (b.lastSeenAt || '').localeCompare(a.lastSeenAt || ''));
      context.res = { status: 200, body: users };
    } catch (err) {
      context.log.error(err);
      context.res = { status: 500, body: { error: err.message } };
    }
    return;
  }

  context.res = { status: 405, body: { error: 'Method not allowed' } };
};
