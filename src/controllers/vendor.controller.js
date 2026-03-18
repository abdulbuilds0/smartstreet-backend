const pool = require('../db/pool');

exports.getAllVendors = async (req, res) => {
  const { category, search, lat, lng, radius = 10 } = req.query;
  try {
    let query = `
      SELECT v.*, c.name AS category_name, c.icon AS category_icon,
             COALESCE(AVG(r.rating), 0)::NUMERIC(3,1) AS avg_rating,
             COUNT(r.id) AS review_count
      FROM vendors v
      LEFT JOIN categories c ON v.category_id = c.id
      LEFT JOIN reviews r ON r.vendor_id = v.id
      WHERE v.is_active = TRUE
    `;
    const params = [];

    if (category) {
      params.push(category);
      query += ` AND c.name ILIKE $${params.length}`;
    }
    if (search) {
      params.push(`%${search}%`);
      query += ` AND (v.shop_name ILIKE $${params.length} OR v.description ILIKE $${params.length})`;
    }

    query += ` GROUP BY v.id, c.name, c.icon ORDER BY v.created_at DESC`;
    const result = await pool.query(query, params);

    if (lat && lng) {
      const filtered = result.rows.filter(v => {
        if (!v.lat || !v.lng) return false;
        const R = 6371;
        const dLat = ((v.lat - lat) * Math.PI) / 180;
        const dLng = ((v.lng - lng) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) ** 2 +
          Math.cos((lat * Math.PI) / 180) *
          Math.cos((v.lat * Math.PI) / 180) *
          Math.sin(dLng / 2) ** 2;
        const distance = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        v.distance_km = Math.round(distance * 10) / 10;
        return distance <= parseFloat(radius);
      });
      return res.json(filtered.sort((a, b) => a.distance_km - b.distance_km));
    }

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch vendors' });
  }
};

exports.getVendorById = async (req, res) => {
  try {
    const vendor = await pool.query(`
      SELECT v.*, c.name AS category_name, c.icon AS category_icon,
             COALESCE(AVG(r.rating), 0)::NUMERIC(3,1) AS avg_rating,
             COUNT(r.id) AS review_count
      FROM vendors v
      LEFT JOIN categories c ON v.category_id = c.id
      LEFT JOIN reviews r ON r.vendor_id = v.id
      WHERE v.id = $1 AND v.is_active = TRUE
      GROUP BY v.id, c.name, c.icon
    `, [req.params.id]);

    if (vendor.rows.length === 0) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    const products = await pool.query(
      'SELECT * FROM products WHERE vendor_id = $1 AND is_available = TRUE',
      [req.params.id]
    );

    res.json({ ...vendor.rows[0], products: products.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch vendor' });
  }
};
