const express = require('express');
const {
  getAllReviews,
  getReviewsByProduct,
  getReview,
  createReview,
  updateReview,
  deleteReview
} = require('../controllers/reviewController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all reviews (admin only)
router.get('/', requireAdmin, getAllReviews);

// Get reviews for a specific product (public)
router.get('/product/:productId', getReviewsByProduct);

// Get single review
router.get('/:id', getReview);

// Create review
router.post('/', createReview);

// Update review (admin only or review owner - simplified to admin only for now)
router.put('/:id', requireAdmin, updateReview);

// Delete review (admin only or review owner - simplified to admin only for now)
router.delete('/:id', requireAdmin, deleteReview);

module.exports = router;
