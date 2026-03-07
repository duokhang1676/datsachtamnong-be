const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Vui lòng nhập tên danh mục'],
    trim: true
  },
  slug: {
    type: String
  },
  description: {
    type: String,
    trim: true
  },
  image: {
    url: {
      type: String,
      default: ''
    },
    publicId: {
      type: String,
      default: ''
    }
  },
  type: {
    type: String,
    required: true,
    enum: ['product', 'news'],
    default: 'product'
  },
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Generate slug from name before saving
categorySchema.pre('save', function(next) {
  if (this.isModified('name') || this.isModified('type')) {
    // Convert Vietnamese to slug, include type to make it unique
    let slug = this.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
    
    // Add type prefix to make slug unique
    this.slug = `${this.type}-${slug}`;
  }
  next();
});

// Compound unique index on name + type (allows same name for different types)
categorySchema.index({ name: 1, type: 1 }, { unique: true });

// Other indexes
categorySchema.index({ type: 1, isActive: 1, order: 1 });
categorySchema.index({ slug: 1 }, { unique: true });

module.exports = mongoose.model('Category', categorySchema);
