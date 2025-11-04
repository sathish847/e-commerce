const express = require('express');
const {
  getAllMiniCategories,
  getMiniCategoriesByCategoryAndSubCategory,
  getMiniCategory,
  createMiniCategory,
  updateMiniCategory,
  deleteMiniCategory
} = require('../controllers/miniCategoryController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// All mini category routes require authentication
router.use(authenticateToken);

// Routes accessible by authenticated users
router.get('/', getAllMiniCategories);
router.get('/category/:categoryName/subcategory/:subCategoryName', getMiniCategoriesByCategoryAndSubCategory);
router.get('/:id', getMiniCategory);

// Admin only routes
router.post('/', requireAdmin, createMiniCategory);
router.put('/:id', requireAdmin, updateMiniCategory);
router.delete('/:id', requireAdmin, deleteMiniCategory);

module.exports = router;
