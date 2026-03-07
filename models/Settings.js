const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
  siteName: {
    type: String,
    required: [true, 'Vui lòng nhập tên công ty'],
    default: 'Đất Sạch Tam Nông'
  },
  slogan: {
    type: String,
    default: 'Nông nghiệp - Nông dân - Nông thôn'
  },
  logo: {
    type: String,
    default: ''
  },
  favicon: {
    type: String,
    default: ''
  },
  contactEmail: {
    type: String,
    required: [true, 'Vui lòng nhập email liên hệ'],
    default: 'datcsachtamnong@gmail.com'
  },
  contactPhone: {
    type: String,
    required: [true, 'Vui lòng nhập số điện thoại'],
    default: '0867.68.68.69'
  },
  address: {
    type: String,
    required: [true, 'Vui lòng nhập địa chỉ'],
    default: '121/1 ấp Thạnh Mỹ, xã Quới Điền, tỉnh Vĩnh Long'
  },
  factory: {
    type: String,
    default: 'Nhà máy sản xuất: Ấp An Nhơn 2, xã Mỏ Cày, tỉnh Vĩnh Long'
  },
  socialMedia: {
    facebook: {
      type: String,
      default: 'https://facebook.com/datsachtamnong'
    },
    zalo: {
      type: String,
      default: 'https://zalo.me/0867686869'
    },
    instagram: {
      type: String,
      default: ''
    }
  },
  seo: {
    metaTitle: {
      type: String,
      default: 'Đất Sạch Tam Nông - Đất hữu cơ chất lượng cao'
    },
    metaDescription: {
      type: String,
      default: 'Đất sạch dinh dưỡng Tam Nông - Sử dụng trực tiếp tốt cho mọi loại cây trồng. Tơi xốp, thoát nước tốt, giàu hữu cơ.'
    }
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Ensure only one settings document exists
SettingsSchema.statics.getSingletonSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

module.exports = mongoose.model('Settings', SettingsSchema);
