const express = require('express');
const { register, createAdmin, login, getProfile, updatePassword, generatePasswordResetToken, resetPasswordWithToken } = require('../controllers/authController');
const { authenticateToken, requireAdmin, authenticatePasswordResetToken } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/generate-password-reset-token', generatePasswordResetToken);
router.post('/reset-password-with-token', authenticatePasswordResetToken, resetPasswordWithToken);

// Admin routes (for creating new admins - should be protected in production)
router.post('/create-admin', createAdmin);

// Protected routes
router.get('/profile', authenticateToken, getProfile);
router.put('/update-password', authenticateToken, updatePassword);

module.exports = router;
