const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getNews,
  getNewsById,
  getNewsBySlug,
  createNews,
  updateNews,
  deleteNews,
  getNewsStats
} = require('../controllers/newsController');

// Public routes
router.get('/', getNews);
router.get('/slug/:slug', getNewsBySlug);
router.get('/:id', getNewsById);

// Protected routes (Admin only)
router.post('/', protect, authorize('admin'), createNews);
router.put('/:id', protect, authorize('admin'), updateNews);
router.delete('/:id', protect, authorize('admin'), deleteNews);
router.get('/stats/dashboard', protect, authorize('admin'), getNewsStats);

module.exports = router;
