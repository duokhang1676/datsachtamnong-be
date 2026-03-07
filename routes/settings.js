const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getSettings,
  updateSettings,
  resetSettings
} = require('../controllers/settingsController');

// Public routes
router.get('/', getSettings);

// Protected routes (Admin only)
router.put('/', protect, authorize('admin'), updateSettings);
router.post('/reset', protect, authorize('admin'), resetSettings);

module.exports = router;
