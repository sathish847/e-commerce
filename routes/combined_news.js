const express = require('express');
const { getAllCombinedNews } = require('../controllers/combinedNewsController');

const router = express.Router();

// Public route - no authentication required
router.get('/', getAllCombinedNews);

// Test route
router.get('/test', (req, res) => {
  res.send('Hello World');
});

module.exports = router;
