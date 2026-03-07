const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProduct,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  addReview,
  getProductStats
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(getProducts)
  .post(protect, authorize('admin'), createProduct);

router.get('/stats/dashboard', protect, authorize('admin'), getProductStats);

router.route('/:id')
  .get(getProduct)
  .put(protect, authorize('admin'), updateProduct)
  .delete(protect, authorize('admin'), deleteProduct);

router.get('/slug/:slug', getProductBySlug);
router.post('/:id/reviews', protect, addReview);

module.exports = router;
