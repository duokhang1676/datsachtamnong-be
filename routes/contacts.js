const express = require('express');
const router = express.Router();
const {
  getContacts,
  getContact,
  createContact,
  updateContactStatus,
  deleteContact,
  getContactStats
} = require('../controllers/contactController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(protect, authorize('admin'), getContacts)
  .post(createContact);

router.get('/stats/dashboard', protect, authorize('admin'), getContactStats);

router.route('/:id')
  .get(protect, authorize('admin'), getContact)
  .delete(protect, authorize('admin'), deleteContact);

router.put('/:id/status', protect, authorize('admin'), updateContactStatus);

module.exports = router;
