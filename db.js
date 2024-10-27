const { Pool } = require('pg');
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'joyas',
  password: 'lacroix_713',
  port: 5432,
});
module.exports = pool;
