const express = require('express');
const router = express.Router();
const {
  uploadImage,
  uploadImages,
  deleteImage
} = require('../controllers/uploadController');
const { protect, authorize } = require('../middleware/auth');

router.post('/image', protect, authorize('admin'), uploadImage);
router.post('/images', protect, authorize('admin'), uploadImages);
router.delete('/image/:publicId', protect, authorize('admin'), deleteImage);

module.exports = router;
