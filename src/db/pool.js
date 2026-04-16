require('dotenv').config();
const { Pool } = require('pg');

const connectionString =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.SUPABASE_DATABASE_URL;

if (!connectionString) {
  throw new Error('Missing database connection string. Set DATABASE_URL in environment variables.');
}

const pool = new Pool({
  connectionString,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

pool.on('connect', () => console.log('Connected to PostgreSQL database'));
pool.on('error', (err) => console.error('Database connection error:', err));

module.exports = pool;
