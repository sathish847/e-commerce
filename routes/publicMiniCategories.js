const express = require('express');
const {
  getAllMiniCategories,
  getMiniCategoriesByCategoryAndSubCategory,
  getMiniCategory
} = require('../controllers/miniCategoryController');

const router = express.Router();

// Public routes - no authentication required
router.get('/', getAllMiniCategories);
router.get('/category/:categoryName/subcategory/:subCategoryName', getMiniCategoriesByCategoryAndSubCategory);
router.get('/:id', getMiniCategory);

module.exports = router;
