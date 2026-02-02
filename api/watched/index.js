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

  const table = getTableClient('Watched');
  const method = (req.method || '').toUpperCase();

  try {
    if (method === 'GET') {
      const entities = [];
      const iter = table.listEntities({ queryOptions: { filter: `PartitionKey eq '${oid}'` } });
      for await (const e of iter) {
        entities.push({
          movie: JSON.parse(e.movie || '{}'),
          comment: e.comment,
          userRating: e.userRating != null ? Number(e.userRating) : undefined,
        });
      }
      entities.sort((a, b) => (b.watchedAt || 0) - (a.watchedAt || 0));
      context.res = { status: 200, body: entities };
      return;
    }

    if (method === 'POST') {
      const { movie, comment, userRating } = req.body || {};
      if (!movie || !movie.title) {
        context.res = { status: 400, body: { error: 'Movie required' } };
        return;
      }
      const movieKey = `${movie.title || ''}-${movie.year || ''}`;
      const safeKey = movieKey.replace(/[#\\?/]/g, '_');
      await table.upsertEntity({
        partitionKey: oid,
        rowKey: safeKey,
        movie: JSON.stringify(movie),
        comment: comment || '',
        userRating: userRating != null ? String(userRating) : '',
        watchedAt: String(Date.now()),
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
