const pool = require('../db/pool');

exports.getReviews = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT r.*, u.name AS user_name, u.avatar_url
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.vendor_id = $1
      ORDER BY r.created_at DESC
    `, [req.params.vendorId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
};

exports.createReview = async (req, res) => {
  const { rating, comment } = req.body;
  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5' });
  }
  try {
    const result = await pool.query(`
      INSERT INTO reviews (vendor_id, user_id, rating, comment)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [req.params.vendorId, req.user.id, rating, comment]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'You have already reviewed this vendor' });
    }
    res.status(500).json({ error: 'Failed to submit review' });
  }
};
