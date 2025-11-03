const express = require('express');
const {
  getAllNews,
  getDeletedNews,
  getNews,
  getNewsByCategory,
  getNewsBySlug,
  createNews,
  updateNews,
  deleteNews,
  hardDeleteNews,
  getNewsImage,
  getNewsThumb,
  uploadFields
} = require('../controllers/newsController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Public routes (no authentication required)
router.get('/public', getAllNews);
router.get('/category/:categoryId', getAllNews); // Get news by category (public)
router.get('/slug/:slug', getNewsBySlug); // Get news by slug (public)
router.get('/:id/image/:imageIndex', getNewsImage); // Get image by news ID and index (public)
router.get('/:id/thumb', getNewsThumb); // Get thumbnail by news ID (public)

// Create a separate router for authenticated routes
const authRouter = express.Router();
authRouter.use(authenticateToken);

// Protected routes (authenticated users can view news)
authRouter.get('/', getAllNews);

// Admin only routes
authRouter.get('/deleted', requireAdmin, getDeletedNews);
authRouter.post('/', requireAdmin, uploadFields, createNews);
authRouter.put('/:id', requireAdmin, updateNews);
authRouter.delete('/:id', requireAdmin, deleteNews);

// Hard delete (admin only, permanent deletion)
authRouter.delete('/:id/hard', requireAdmin, hardDeleteNews);

// Generic routes (must come last to avoid conflicts)
authRouter.get('/:id', getNews);

// Mount the authenticated routes under the main router
router.use('/', authRouter);

module.exports = router;
