const express = require('express');
const {
  getAllTrendingNews,
  getDeletedTrendingNews,
  getTrendingNews,
  getTrendingNewsBySlug,
  createTrendingNews,
  updateTrendingNews,
  deleteTrendingNews,
  hardDeleteTrendingNews,
  getTrendingNewsThumb,
  uploadFields
} = require('../controllers/trendingNewsController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Public routes (no authentication required)
router.get('/public', getAllTrendingNews);
router.get('/slug/:slug', getTrendingNewsBySlug); // Get trending news by slug (public)
router.get('/:id/thumb', getTrendingNewsThumb); // Get thumbnail by trending news ID (public)

// Create a separate router for authenticated routes
const authRouter = express.Router();
authRouter.use(authenticateToken);

// Protected routes (authenticated users can view trending news)
authRouter.get('/', getAllTrendingNews);

// Admin only routes
authRouter.get('/deleted', requireAdmin, getDeletedTrendingNews);
authRouter.post('/', requireAdmin, uploadFields, createTrendingNews);
authRouter.put('/:id', requireAdmin, updateTrendingNews);
authRouter.delete('/:id', requireAdmin, deleteTrendingNews);

// Hard delete (admin only, permanent deletion)
authRouter.delete('/:id/hard', requireAdmin, hardDeleteTrendingNews);

// Generic routes (must come last to avoid conflicts)
authRouter.get('/:id', getTrendingNews);

// Mount the authenticated routes under the main router
router.use('/', authRouter);

module.exports = router;
