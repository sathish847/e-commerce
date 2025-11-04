const express = require('express');
const {
  getAllCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// All category routes require authentication
router.use(authenticateToken);

// Public routes for authenticated users
router.get('/', getAllCategories);
router.get('/:id', getCategory);

// Admin only routes
router.post('/', requireAdmin, createCategory);
router.put('/:id', requireAdmin, updateCategory);
router.delete('/:id', requireAdmin, deleteCategory);

module.exports = router;
