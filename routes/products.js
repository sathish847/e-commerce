const express = require('express');
const {
  getAllProducts,
  getAllProductsAdmin,
  getProduct,
  getProductsByCategory,
  getProductsByTag,
  getNewProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  upload
} = require('../controllers/productController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Public routes (no authentication required)
router.get('/', getAllProducts);
router.get('/new', getNewProducts);
router.get('/category/:categoryName', getProductsByCategory);
router.get('/tag/:tagName', getProductsByTag);
router.get('/:id', getProduct);

// All other routes require authentication
router.use(authenticateToken);

// Authenticated routes (any authenticated user)
router.get('/admin/all', getAllProductsAdmin);

// Admin only routes
router.post('/', requireAdmin, createProduct);
router.put('/:id', requireAdmin, updateProduct);
router.delete('/:id', requireAdmin, deleteProduct);

module.exports = router;
