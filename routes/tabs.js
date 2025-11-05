const express = require('express');
const {
  getAllTabs,
  getTab,
  createTab,
  updateTab,
  deleteTab
} = require('../controllers/tabController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// All tab routes require authentication
router.use(authenticateToken);

// Routes accessible by authenticated users
router.get('/', getAllTabs);
router.get('/:id', getTab);

// Admin only routes
router.post('/', requireAdmin, createTab);
router.put('/:id', requireAdmin, updateTab);
router.delete('/:id', requireAdmin, deleteTab);

module.exports = router;
