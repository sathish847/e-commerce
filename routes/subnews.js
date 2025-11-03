const express = require('express');
const {
  getAllSubNews,
  getDeletedSubNews,
  getSubNews,
  getSubNewsByCategory,
  getSubNewsBySlug,
  createSubNews,
  updateSubNews,
  deleteSubNews,
  hardDeleteSubNews,
  getSubNewsThumb,
  uploadFields
} = require('../controllers/subNewsController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Public routes (no authentication required)
router.get('/public', getAllSubNews);
router.get('/category/:categoryId', getSubNewsByCategory); // Get subnews by category (public)
router.get('/slug/:slug', getSubNewsBySlug); // Get subnews by slug (public)
router.get('/:id/thumb', getSubNewsThumb); // Get thumbnail by subnews ID (public)

// Create a separate router for authenticated routes
const authRouter = express.Router();
authRouter.use(authenticateToken);

// Protected routes (authenticated users can view subnews)
authRouter.get('/', getAllSubNews);

// Admin only routes
authRouter.get('/deleted', requireAdmin, getDeletedSubNews);
authRouter.post('/', requireAdmin, uploadFields, createSubNews);
authRouter.put('/:id', requireAdmin, updateSubNews);
authRouter.delete('/:id', requireAdmin, deleteSubNews);

// Hard delete (admin only, permanent deletion)
authRouter.delete('/:id/hard', requireAdmin, hardDeleteSubNews);

// Generic routes (must come last to avoid conflicts)
authRouter.get('/:id', getSubNews);

// Mount the authenticated routes under the main router
router.use('/', authRouter);

module.exports = router;
