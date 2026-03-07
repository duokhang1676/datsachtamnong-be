const express = require('express');
const router = express.Router();
const {
  getOrders,
  getOrder,
  createOrder,
  updateOrder,
  updateOrderStatus,
  deleteOrder,
  getOrderStats
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(protect, authorize('admin'), getOrders)
  .post(createOrder);

router.get('/stats/dashboard', protect, authorize('admin'), getOrderStats);

router.route('/:id')
  .get(protect, getOrder)
  .put(protect, authorize('admin'), updateOrder)
  .delete(protect, authorize('admin'), deleteOrder);

router.put('/:id/status', protect, authorize('admin'), updateOrderStatus);

module.exports = router;
