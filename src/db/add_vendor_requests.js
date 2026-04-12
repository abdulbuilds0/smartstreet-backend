require('dotenv').config();
const pool = require('./pool');

const addVendorRequests = async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS vendor_requests (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        shop_name   VARCHAR(150) NOT NULL,
        category_id INT REFERENCES categories(id),
        description TEXT,
        phone       VARCHAR(20),
        address     TEXT,
        lat         NUMERIC(10,7),
        lng         NUMERIC(10,7),
        owner_name  VARCHAR(100),
        owner_email VARCHAR(150),
        status      VARCHAR(20) DEFAULT 'pending',
        created_at  TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('vendor_requests table created!');
  } catch (err) {
    console.error('Failed:', err);
  } finally {
    client.release();
    process.exit();
  }
};

addVendorRequests();
