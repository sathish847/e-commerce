const express = require('express');
const {
  getAllHeroSliders,
  getHeroSlider
} = require('../controllers/heroSliderController');

const router = express.Router();

// Public routes - no authentication required
router.get('/', getAllHeroSliders);
router.get('/:id', getHeroSlider);

module.exports = router;
