const express = require('express');
const passport = require('passport');
const { register, createAdmin, login, getProfile, updatePassword, generatePasswordResetToken, resetPasswordWithToken, googleAuth, googleAuthCallback } = require('../controllers/authController');
const { authenticateToken, requireAdmin, authenticatePasswordResetToken } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/generate-password-reset-token', generatePasswordResetToken);
router.post('/reset-password-with-token', authenticatePasswordResetToken, resetPasswordWithToken);

// Google OAuth routes
router.get('/google', googleAuth);
router.get('/google/callback', passport.authenticate('google', { session: false }), googleAuthCallback);

// Admin routes (for creating new admins - should be protected in production)
router.post('/create-admin', createAdmin);

// Protected routes
router.get('/profile', authenticateToken, getProfile);
router.put('/update-password', authenticateToken, updatePassword);

module.exports = router;
