const express = require('express');
const router = express.Router();
const {
  getCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  unsubscribeCustomer,
  getCustomerStats
} = require('../controllers/customerController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(protect, authorize('admin'), getCustomers)
  .post(createCustomer);

router.get('/stats/dashboard', protect, authorize('admin'), getCustomerStats);

router.route('/:id')
  .get(protect, authorize('admin'), getCustomer)
  .put(protect, authorize('admin'), updateCustomer)
  .delete(protect, authorize('admin'), deleteCustomer);

router.put('/:id/unsubscribe', unsubscribeCustomer);

module.exports = router;
