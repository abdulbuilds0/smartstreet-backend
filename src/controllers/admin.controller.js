const pool = require('../db/pool');
const { upload } = require('../services/cloudinary.service');

exports.uploadMiddleware = upload.array('images', 5);

exports.addVendor = async (req, res) => {
  const { shop_name, category_id, description, phone, address, lat, lng } = req.body;
  if (!shop_name) return res.status(400).json({ error: 'Shop name is required' });
  try {
    const images = req.files ? req.files.map(f => f.path) : [];
    const result = await pool.query(`
      INSERT INTO vendors (shop_name, category_id, description, phone, address, lat, lng, images, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *
    `, [shop_name, category_id, description, phone, address, lat, lng, images, req.user.id]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add vendor' });
  }
};

exports.updateVendor = async (req, res) => {
  const { shop_name, category_id, description, phone, address, lat, lng, is_active } = req.body;
  try {
    const images = req.files && req.files.length > 0 ? req.files.map(f => f.path) : undefined;
    const result = await pool.query(`
      UPDATE vendors SET
        shop_name   = COALESCE($1, shop_name),
        category_id = COALESCE($2, category_id),
        description = COALESCE($3, description),
        phone       = COALESCE($4, phone),
        address     = COALESCE($5, address),
        lat         = COALESCE($6, lat),
        lng         = COALESCE($7, lng),
        is_active   = COALESCE($8, is_active),
        images      = COALESCE($9, images)
      WHERE id = $10 RETURNING *
    `, [shop_name, category_id, description, phone, address, lat, lng, is_active, images || null, req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Vendor not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update vendor' });
  }
};

exports.deleteVendor = async (req, res) => {
  try {
    await pool.query('UPDATE vendors SET is_active = FALSE WHERE id = $1', [req.params.id]);
    res.json({ message: 'Vendor deactivated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete vendor' });
  }
};

exports.addProduct = async (req, res) => {
  const { name, description, price } = req.body;
  if (!name) return res.status(400).json({ error: 'Product name is required' });
  try {
    const images = req.files ? req.files.map(f => f.path) : [];
    const result = await pool.query(`
      INSERT INTO products (vendor_id, name, description, price, images)
      VALUES ($1, $2, $3, $4, $5) RETURNING *
    `, [req.params.vendorId, name, description, price, images]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add product' });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    await pool.query('DELETE FROM products WHERE id = $1', [req.params.id]);
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
};

exports.listUsers = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};
