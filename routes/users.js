const express = require('express');
const {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser
} = require('../controllers/userController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// All user routes require authentication
router.use(authenticateToken);

// Admin only routes
router.get('/', requireAdmin, getAllUsers);
router.post('/', requireAdmin, createUser);

// Routes accessible by authenticated users
router.get('/:id', getUser);
router.put('/:id', updateUser);
router.delete('/:id', requireAdmin, deleteUser);

module.exports = router;
