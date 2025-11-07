const express = require('express');
const {
  getAllHeroSlidersAdmin,
  getHeroSlider,
  createHeroSlider,
  updateHeroSlider,
  deleteHeroSlider
} = require('../controllers/heroSliderController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// All hero slider routes require authentication
router.use(authenticateToken);

// Public routes for authenticated users (only active sliders)
router.get('/', getAllHeroSlidersAdmin);
router.get('/:id', getHeroSlider);

// Admin only routes
router.post('/', requireAdmin, createHeroSlider);
router.put('/:id', requireAdmin, updateHeroSlider);
router.delete('/:id', requireAdmin, deleteHeroSlider);

module.exports = router;
