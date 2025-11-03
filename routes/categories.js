const express = require('express');
const {
  getAllCategories,
  getDeletedCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  hardDeleteCategory
} = require('../controllers/categoryController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Public routes (no authentication required)
router.get('/public', getAllCategories);

// Create a separate router for authenticated routes
const authRouter = express.Router();
authRouter.use(authenticateToken);

// Protected routes (authenticated users can view categories)
authRouter.get('/', getAllCategories);

// Admin only routes
authRouter.get('/deleted', requireAdmin, getDeletedCategories);
authRouter.post('/', requireAdmin, createCategory);
authRouter.put('/:id', requireAdmin, updateCategory);
authRouter.delete('/:id', requireAdmin, deleteCategory);

// Hard delete (admin only, permanent deletion)
authRouter.delete('/:id/hard', requireAdmin, hardDeleteCategory);

// Generic routes (must come last to avoid conflicts)
authRouter.get('/:id', getCategory);

// Mount the authenticated routes under the main router
router.use('/', authRouter);

module.exports = router;
