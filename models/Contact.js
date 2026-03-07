const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Vui lòng nhập tên'],
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
    required: [true, 'Vui lòng nhập số điện thoại'],
    trim: true
  },
  message: {
    type: String,
    required: [true, 'Vui lòng nhập nội dung'],
    trim: true
  },
  status: {
    type: String,
    enum: ['new', 'read', 'replied'],
    default: 'new'
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  repliedAt: {
    type: Date
  },
  repliedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  replyNote: {
    type: String
  }
}, {
  timestamps: true
});

// Index for status and date queries
contactSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Contact', contactSchema);
