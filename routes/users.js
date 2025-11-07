const express = require('express');
const {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  getUserDetailsByEmail,
  checkUserDetailsComplete,
  updateUserDetailsByEmail,
  deleteUser
} = require('../controllers/userController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Admin only routes (require authentication + admin)
router.get('/', authenticateToken, requireAdmin, getAllUsers);
router.post('/', authenticateToken, requireAdmin, createUser);
router.delete('/:id', authenticateToken, requireAdmin, deleteUser);

// Routes accessible by authenticated users
router.get('/details/:email', authenticateToken, getUserDetailsByEmail);
router.get('/check-details/:email', authenticateToken, checkUserDetailsComplete);
router.put('/update-details', authenticateToken, updateUserDetailsByEmail); // For requests without email in URL
router.put('/profile/update-details/:email', authenticateToken, updateUserDetailsByEmail);
router.put('/profile/update-details', authenticateToken, updateUserDetailsByEmail); // For requests without email in URL
router.get('/:id', authenticateToken, getUser);
router.put('/:id', authenticateToken, updateUser);

// Debug route to check if routes are working
router.get('/test', (req, res) => {
  res.json({ message: 'User routes working' });
});

module.exports = router;
