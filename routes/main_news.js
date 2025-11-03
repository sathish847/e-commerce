const express = require('express');
const {
  getAllMainNews,
  getDeletedMainNews,
  getMainNews,
  getMainNewsBySlug,
  createMainNews,
  updateMainNews,
  deleteMainNews,
  hardDeleteMainNews,
  getMainNewsThumb,
  uploadFields
} = require('../controllers/mainNewsController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Public routes (no authentication required)
router.get('/public', getAllMainNews);
router.get('/slug/:slug', getMainNewsBySlug); // Get main news by slug (public)
router.get('/:id/thumb', getMainNewsThumb); // Get thumbnail by main news ID (public)

// Create a separate router for authenticated routes
const authRouter = express.Router();
authRouter.use(authenticateToken);

// Protected routes (authenticated users can view main news)
authRouter.get('/', getAllMainNews);

// Admin only routes
authRouter.get('/deleted', requireAdmin, getDeletedMainNews);
authRouter.post('/', requireAdmin, uploadFields, createMainNews);
authRouter.put('/:id', requireAdmin, updateMainNews);
authRouter.delete('/:id', requireAdmin, deleteMainNews);

// Hard delete (admin only, permanent deletion)
authRouter.delete('/:id/hard', requireAdmin, hardDeleteMainNews);

// Generic routes (must come last to avoid conflicts)
authRouter.get('/:id', getMainNews);

// Mount the authenticated routes under the main router
router.use('/', authRouter);

module.exports = router;
