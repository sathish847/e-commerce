const express = require('express');
const router = express.Router();
const { searchProducts } = require('../controllers/productController');

// @route   GET /api/public/products/search
// @desc    Search products by name
// @access  Public
router.get('/search', searchProducts);

module.exports = router;