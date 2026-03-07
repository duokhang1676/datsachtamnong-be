const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Vui lòng nhập tên khách hàng'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Vui lòng nhập email'],
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Email không hợp lệ']
  },
  phone: {
    type: String,
    trim: true
  },
  source: {
    type: String,
    enum: ['footer', 'checkout', 'manual', 'contact'],
    default: 'manual'
  },
  status: {
    type: String,
    enum: ['active', 'unsubscribed'],
    default: 'active'
  },
  note: {
    type: String,
    default: ''
  },
  ipAddress: {
    type: String
  },
  subscribedAt: {
    type: Date,
    default: Date.now
  },
  unsubscribedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for email lookup
customerSchema.index({ email: 1 });
customerSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Customer', customerSchema);
