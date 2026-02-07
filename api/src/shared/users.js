const { getTableClient } = require('./table');

async function ensureUser(claims) {
  if (!claims || !claims.oid) return;
  const table = getTableClient('Users');
  const now = new Date().toISOString();
  await table.upsertEntity({
    partitionKey: 'user',
    rowKey: claims.oid,
    displayName: claims.name || 'Unknown',
    email: claims.email || '',
    lastSeenAt: now,
  });
}

module.exports = { ensureUser };
