const express = require('express');
const router = express.Router();
const { getReviews, createReview } = require('../controllers/review.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.get('/vendor/:vendorId', getReviews);
router.post('/vendor/:vendorId', authenticate, createReview);

module.exports = router;
