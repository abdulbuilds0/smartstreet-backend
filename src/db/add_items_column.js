require('dotenv').config();
const pool = require('./pool');
const run = async () => {
  const client = await pool.connect();
  try {
    await client.query('ALTER TABLE vendor_requests ADD COLUMN IF NOT EXISTS items TEXT');
    await client.query('ALTER TABLE vendors ADD COLUMN IF NOT EXISTS items TEXT');
    console.log('Done! items column added');
  } catch (err) { console.error(err); }
  finally { client.release(); process.exit(); }
};
run();
