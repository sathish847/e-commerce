const express = require('express');
const {
  getAllTabs,
  getTab
} = require('../controllers/tabController');

const router = express.Router();

// Public routes - no authentication required
router.get('/', getAllTabs);
router.get('/:id', getTab);

module.exports = router;
