const express = require('express');
const {
  getAllSubCategories,
  getSubCategoriesByCategory,
  getSubCategory
} = require('../controllers/subCategoryController');

const router = express.Router();

// Public routes - no authentication required
router.get('/', getAllSubCategories);
router.get('/category/:categoryName', getSubCategoriesByCategory);
router.get('/:id', getSubCategory);

module.exports = router;
