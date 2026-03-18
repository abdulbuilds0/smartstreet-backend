const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth.middleware');
const admin = require('../controllers/admin.controller');

router.use(authenticate, requireAdmin);

router.post('/vendors', admin.uploadMiddleware, admin.addVendor);
router.put('/vendors/:id', admin.uploadMiddleware, admin.updateVendor);
router.delete('/vendors/:id', admin.deleteVendor);
router.post('/vendors/:vendorId/products', admin.uploadMiddleware, admin.addProduct);
router.delete('/products/:id', admin.deleteProduct);
router.get('/users', admin.listUsers);

module.exports = router;
