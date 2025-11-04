const express = require('express');
const {
  getAllCategories,
  getCategory
} = require('../controllers/categoryController');

const router = express.Router();

// Public routes - no authentication required
router.get('/', getAllCategories);
router.get('/:id', getCategory);

module.exports = router;
