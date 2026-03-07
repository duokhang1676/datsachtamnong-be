const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  image: {
    url: {
      type: String,
      required: [true, 'Vui lòng upload hình ảnh banner']
    },
    publicId: {
      type: String,
      required: true
    }
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for queries
bannerSchema.index({ order: 1 });

module.exports = mongoose.model('Banner', bannerSchema);
