const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const { authenticate, requireAdmin } = require('../middleware/auth.middleware');
const { upload } = require('../services/cloudinary.service');

const uploadMiddleware = upload.array('images', 3);

router.post('/', (req, res, next) => {
  uploadMiddleware(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    next();
  });
}, async (req, res) => {
  console.log('Body received:', req.body);
  const shop_name = req.body.shop_name || '';
  const owner_name = req.body.owner_name || '';
  const phone = req.body.phone || '';
  const category_id = req.body.category_id || null;
  const description = req.body.description || '';
  const address = req.body.address || '';
  const lat = req.body.lat || null;
  const lng = req.body.lng || null;
  const owner_email = req.body.owner_email || '';

  if (!shop_name || !owner_name || !phone) {
    return res.status(400).json({ error: 'Shop name, owner name and phone are required' });
  }
  try {
    const images = req.files ? req.files.map(f => f.path) : [];
    const result = await pool.query(`
      INSERT INTO vendor_requests (shop_name, category_id, description, phone, address, lat, lng, owner_name, owner_email, images)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *
    `, [shop_name, category_id, description, phone, address, lat, lng, owner_name, owner_email, images]);
    res.status(201).json({ message: 'Request submitted successfully!', data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to submit request' });
  }
});

router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT vr.*, c.name AS category_name
      FROM vendor_requests vr
      LEFT JOIN categories c ON vr.category_id = c.id
      ORDER BY vr.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

router.put('/:id/approve', authenticate, requireAdmin, async (req, res) => {
  try {
    const reqResult = await pool.query('SELECT * FROM vendor_requests WHERE id = $1', [req.params.id]);
    if (reqResult.rows.length === 0) return res.status(404).json({ error: 'Request not found' });
    const r = reqResult.rows[0];
    await pool.query(`
      INSERT INTO vendors (shop_name, category_id, description, phone, address, lat, lng, images, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, [r.shop_name, r.category_id, r.description, r.phone, r.address, r.lat, r.lng, r.images, req.user.id]);
    await pool.query('UPDATE vendor_requests SET status = $1 WHERE id = $2', ['approved', req.params.id]);
    res.json({ message: 'Vendor approved and added successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to approve vendor' });
  }
});

router.put('/:id/reject', authenticate, requireAdmin, async (req, res) => {
  try {
    await pool.query('UPDATE vendor_requests SET status = $1 WHERE id = $2', ['rejected', req.params.id]);
    res.json({ message: 'Request rejected' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reject request' });
  }
});

module.exports = router;
