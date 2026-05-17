const { Pool } = require('pg');

const pool = new Pool({
  user:     process.env.DB_USER,
  host:     process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port:     process.env.DB_PORT,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

pool.connect()
  .then(() => console.log('✅ User-service conectado a PostgreSQL'))
  .catch(err => console.error('❌ Error conexión DB:', err.message));

module.exports = pool;