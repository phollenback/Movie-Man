const { getOidFromToken } = require('../src/shared/auth');
const { getTableClient } = require('../src/shared/table');

module.exports = async function (context, req) {
  const oid = await getOidFromToken(
    req.headers?.authorization,
    process.env.ENTRA_CLIENT_ID,
    process.env.ENTRA_TENANT_ID || 'common'
  );
  if (!oid) {
    context.res = { status: 401, body: { error: 'Unauthorized' } };
    return;
  }

  const table = getTableClient('Watchlist');
  const method = (req.method || '').toUpperCase();

  try {
    if (method === 'GET') {
      const entities = [];
      const iter = table.listEntities({ queryOptions: { filter: `PartitionKey eq '${oid}'` } });
      for await (const e of iter) {
        entities.push(JSON.parse(e.movie || '{}'));
      }
      context.res = { status: 200, body: entities };
      return;
    }

    if (method === 'POST') {
      const movie = req.body;
      if (!movie || !movie.title) {
        context.res = { status: 400, body: { error: 'Movie required' } };
        return;
      }
      const movieKey = `${movie.title || ''}-${movie.year || ''}`;
      await table.upsertEntity({
        partitionKey: oid,
        rowKey: movieKey.replace(/[#\\?/]/g, '_'),
        movie: JSON.stringify(movie),
      });
      context.res = { status: 201, body: { ok: true } };
      return;
    }

    if (method === 'DELETE') {
      const movieKey = req.query?.movieKey;
      if (!movieKey) {
        context.res = { status: 400, body: { error: 'movieKey required' } };
        return;
      }
      const safeKey = String(movieKey).replace(/[#\\?/]/g, '_');
      try {
        await table.deleteEntity(oid, safeKey);
      } catch (e) {
        if (e.statusCode !== 404) throw e;
      }
      context.res = { status: 204 };
      return;
    }

    context.res = { status: 405, body: { error: 'Method not allowed' } };
  } catch (err) {
    context.log.error(err);
    context.res = { status: 500, body: { error: err.message } };
  }
};
