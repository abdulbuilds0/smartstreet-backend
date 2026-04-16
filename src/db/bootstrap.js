const pool = require('./pool');

async function bootstrapDatabase() {
  const client = await pool.connect();

  try {
    console.log('Bootstrapping database schema...');

    try {
      await client.query('CREATE EXTENSION IF NOT EXISTS pgcrypto;');
    } catch (err) {
      console.warn('Skipping pgcrypto extension setup:', err.message);
    }

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
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;`);
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();`);

    await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id    SERIAL PRIMARY KEY,
        name  VARCHAR(80) UNIQUE NOT NULL,
        icon  VARCHAR(50)
      );
    `);
    await client.query(`ALTER TABLE categories ADD COLUMN IF NOT EXISTS icon VARCHAR(50);`);

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
        items        TEXT,
        is_active    BOOLEAN DEFAULT TRUE,
        created_by   UUID REFERENCES users(id),
        created_at   TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    await client.query(`ALTER TABLE vendors ADD COLUMN IF NOT EXISTS images TEXT[];`);
    await client.query(`ALTER TABLE vendors ADD COLUMN IF NOT EXISTS items TEXT;`);
    await client.query(`ALTER TABLE vendors ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;`);
    await client.query(`ALTER TABLE vendors ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();`);

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
    await client.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS images TEXT[];`);
    await client.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT TRUE;`);
    await client.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();`);

    await client.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        vendor_id  UUID REFERENCES vendors(id) ON DELETE CASCADE,
        user_id    UUID REFERENCES users(id),
        rating     SMALLINT CHECK (rating BETWEEN 1 AND 5),
        comment    TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    await client.query(`ALTER TABLE reviews ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();`);

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
        images      TEXT[],
        items       TEXT,
        status      VARCHAR(20) DEFAULT 'pending',
        created_at  TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    await client.query(`ALTER TABLE vendor_requests ADD COLUMN IF NOT EXISTS images TEXT[];`);
    await client.query(`ALTER TABLE vendor_requests ADD COLUMN IF NOT EXISTS items TEXT;`);

    await client.query(`
      INSERT INTO categories (name, icon) VALUES
        ('Food', '🍱'),
        ('Handicrafts', '🧵'),
        ('Electronics', '⚡'),
        ('Clothing', '👗'),
        ('Services', '🔧')
      ON CONFLICT (name) DO NOTHING;
    `);

    console.log('Database bootstrap complete.');
  } finally {
    client.release();
  }
}

module.exports = { bootstrapDatabase };

