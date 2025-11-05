const express = require('express');
const {
  getWishlist,
  addToWishlist,
  updateWishlistItem,
  removeFromWishlist,
  clearWishlist,
  checkWishlistStatus
} = require('../controllers/wishlistController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// All wishlist routes require authentication
router.use(authenticateToken);

// Get user's wishlist
router.get('/', getWishlist);

// Add item to wishlist
router.post('/', addToWishlist);

// Update wishlist item quantity
router.put('/:productId', updateWishlistItem);

// Remove item from wishlist
router.delete('/:productId', removeFromWishlist);

// Clear entire wishlist
router.delete('/', clearWishlist);

// Check if product is in wishlist
router.get('/check/:productId', checkWishlistStatus);

module.exports = router;
