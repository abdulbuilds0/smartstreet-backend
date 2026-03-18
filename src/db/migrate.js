require('dotenv').config();
const pool = require('./pool');

const migrate = async () => {
  const client = await pool.connect();
  try {
    console.log('Running migrations...');

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name        VARCHAR(100) NOT NULL,
        email       VARCHAR(150) UNIQUE NOT NULL,
        password    TEXT NOT NULL,
        role        VARCHAR(20) DEFAULT 'user',
        avatar_url  TEXT,
        created_at  TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('users table done');

    await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id    SERIAL PRIMARY KEY,
        name  VARCHAR(80) UNIQUE NOT NULL,
        icon  VARCHAR(50)
      );
    `);
    console.log('categories table done');

    await client.query(`
      CREATE TABLE IF NOT EXISTS vendors (
        id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        shop_name    VARCHAR(150) NOT NULL,
        category_id  INT REFERENCES categories(id),
        description  TEXT,
        phone        VARCHAR(20),
        address      TEXT,
        lat          NUMERIC(10,7),
        lng          NUMERIC(10,7),
        images       TEXT[],
        is_active    BOOLEAN DEFAULT TRUE,
        created_by   UUID REFERENCES users(id),
        created_at   TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('vendors table done');

    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        vendor_id    UUID REFERENCES vendors(id) ON DELETE CASCADE,
        name         VARCHAR(150) NOT NULL,
        description  TEXT,
        price        NUMERIC(10,2),
        images       TEXT[],
        is_available BOOLEAN DEFAULT TRUE,
        created_at   TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('products table done');

    await client.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        vendor_id  UUID REFERENCES vendors(id) ON DELETE CASCADE,
        user_id    UUID REFERENCES users(id),
        rating     SMALLINT CHECK (rating BETWEEN 1 AND 5),
        comment    TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE (vendor_id, user_id)
      );
    `);
    console.log('reviews table done');

    await client.query(`
      INSERT INTO categories (name, icon) VALUES
        ('Food', '🍱'),
        ('Handicrafts', '🧵'),
        ('Electronics', '⚡'),
        ('Clothing', '👗'),
        ('Services', '🔧')
      ON CONFLICT (name) DO NOTHING;
    `);
    console.log('categories seeded');

    console.log('All migrations complete!');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    client.release();
    process.exit();
  }
};

migrate();
