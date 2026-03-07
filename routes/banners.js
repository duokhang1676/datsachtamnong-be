const express = require('express');
const router = express.Router();
const {
  getBanners,
  getBanner,
  createBanner,
  updateBanner,
  deleteBanner,
  reorderBanners
} = require('../controllers/bannerController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(getBanners)
  .post(protect, authorize('admin'), createBanner);

router.put('/reorder', protect, authorize('admin'), reorderBanners);

router.route('/:id')
  .get(getBanner)
  .put(protect, authorize('admin'), updateBanner)
  .delete(protect, authorize('admin'), deleteBanner);

module.exports = router;
