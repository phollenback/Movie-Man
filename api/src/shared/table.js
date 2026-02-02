const { TableClient } = require('@azure/data-tables');

const connStr = process.env.StorageConnectionString;

function getTableClient(tableName) {
  if (!connStr) throw new Error('StorageConnectionString not configured');
  return TableClient.fromConnectionString(connStr, tableName);
}

module.exports = { getTableClient };
