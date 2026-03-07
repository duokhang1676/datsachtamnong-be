const express = require('express');
const router = express.Router();
const {
  getCategories,
  getCategoryById,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryStats
} = require('../controllers/categoryController');

const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getCategories);
router.get('/slug/:slug', getCategoryBySlug);
router.get('/:id', getCategoryById);

// Admin routes
router.post('/', protect, authorize('admin'), createCategory);
router.put('/:id', protect, authorize('admin'), updateCategory);
router.delete('/:id', protect, authorize('admin'), deleteCategory);
router.get('/stats/dashboard', protect, authorize('admin'), getCategoryStats);

module.exports = router;
