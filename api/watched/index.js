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
        const movie = JSON.parse(e.movie || '{}');
        entities.push({
          movie,
          comment: e.comment,
          userRating: e.userRating != null ? Number(e.userRating) : undefined,
          movieKey: `${movie.title || ''}-${movie.year || ''}`,
          _sort: Number(e.sortOrder || e.watchedAt || 0),
        });
      }
      entities.sort((a, b) => b._sort - a._sort);
      const out = entities.map(({ _sort, ...rest }) => rest);
      context.res = { status: 200, body: out };
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
      const now = String(Date.now());
      await table.upsertEntity({
        partitionKey: oid,
        rowKey: safeKey,
        movie: JSON.stringify(movie),
        comment: comment || '',
        userRating: userRating != null ? String(userRating) : '',
        watchedAt: now,
        sortOrder: now,
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

    if (method === 'PATCH') {
      const { movieKey: mk, direction } = req.body || {};
      if (!mk || !['up', 'down'].includes(direction)) {
        context.res = { status: 400, body: { error: 'movieKey and direction (up|down) required' } };
        return;
      }
      const safeKey = String(mk).replace(/[#\\?/]/g, '_');
      const raw = [];
      const iter = table.listEntities({ queryOptions: { filter: `PartitionKey eq '${oid}'` } });
      for await (const e of iter) {
        raw.push({
          ...e,
          sortOrder: e.sortOrder || e.watchedAt || '0',
        });
      }
      raw.sort((a, b) => Number(b.sortOrder) - Number(a.sortOrder));
      const idx = raw.findIndex((e) => e.rowKey === safeKey);
      if (idx < 0) {
        context.res = { status: 404, body: { error: 'Movie not found in log' } };
        return;
      }
      const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= raw.length) {
        context.res = { status: 200, body: { ok: true } };
        return;
      }
      const [a, b] = [raw[idx], raw[swapIdx]];
      const temp = a.sortOrder;
      a.sortOrder = b.sortOrder;
      b.sortOrder = temp;
      const toEntity = (e) => ({
        partitionKey: e.partitionKey,
        rowKey: e.rowKey,
        movie: e.movie,
        comment: e.comment ?? '',
        userRating: e.userRating ?? '',
        watchedAt: e.watchedAt ?? '',
        sortOrder: String(e.sortOrder),
      });
      await table.upsertEntity(toEntity(a));
      await table.upsertEntity(toEntity(b));
      context.res = { status: 200, body: { ok: true } };
      return;
    }

    context.res = { status: 405, body: { error: 'Method not allowed' } };
  } catch (err) {
    context.log.error(err);
    context.res = { status: 500, body: { error: err.message } };
  }
};
