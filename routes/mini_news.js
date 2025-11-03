const express = require('express');
const {
  getAllMiniNews,
  getDeletedMiniNews,
  getMiniNews,
  getMiniNewsByCategory,
  getMiniNewsBySlug,
  createMiniNews,
  updateMiniNews,
  deleteMiniNews,
  hardDeleteMiniNews,
  getMiniNewsThumb,
  uploadFields
} = require('../controllers/miniNewsController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Public routes (no authentication required)
router.get('/public', getAllMiniNews);
router.get('/category/:categoryId', getMiniNewsByCategory); // Get mini news by category (public)
router.get('/slug/:slug', getMiniNewsBySlug); // Get mini news by slug (public)
router.get('/:id/thumb', getMiniNewsThumb); // Get thumbnail by mini news ID (public)

// Create a separate router for authenticated routes
const authRouter = express.Router();
authRouter.use(authenticateToken);

// Protected routes (authenticated users can view mini news)
authRouter.get('/', getAllMiniNews);

// Admin only routes
authRouter.get('/deleted', requireAdmin, getDeletedMiniNews);
authRouter.post('/', requireAdmin, uploadFields, createMiniNews);
authRouter.put('/:id', requireAdmin, updateMiniNews);
authRouter.delete('/:id', requireAdmin, deleteMiniNews);

// Hard delete (admin only, permanent deletion)
authRouter.delete('/:id/hard', requireAdmin, hardDeleteMiniNews);

// Generic routes (must come last to avoid conflicts)
authRouter.get('/:id', getMiniNews);

// Mount the authenticated routes under the main router
router.use('/', authRouter);

module.exports = router;
