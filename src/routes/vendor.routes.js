const express = require('express');
const router = express.Router();
const { getAllVendors, getVendorById } = require('../controllers/vendor.controller');

router.get('/', getAllVendors);
router.get('/:id', getVendorById);

module.exports = router;
