const express = require('express');
const {
  getAllSubCategories,
  getSubCategoriesByCategory,
  getSubCategory,
  createSubCategory,
  updateSubCategory,
  deleteSubCategory
} = require('../controllers/subCategoryController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// All subcategory routes require authentication
router.use(authenticateToken);

// Routes accessible by authenticated users
router.get('/', getAllSubCategories);
router.get('/category/:categoryName', getSubCategoriesByCategory);
router.get('/:id', getSubCategory);

// Admin only routes
router.post('/', requireAdmin, createSubCategory);
router.put('/:id', requireAdmin, updateSubCategory);
router.delete('/:id', requireAdmin, deleteSubCategory);

module.exports = router;
