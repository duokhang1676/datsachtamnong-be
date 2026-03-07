const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

const Settings = require('./models/Settings');

mongoose.connect(process.env.MONGO_URI);

const seedSettings = async () => {
  try {
    // Check if settings already exist
    const existingSettings = await Settings.findOne();
    
    if (existingSettings) {
      console.log('⚠️  Settings already exist in database');
      console.log('Current settings:', existingSettings);
      process.exit(0);
    }

    // Create default settings
    const settings = await Settings.create({
      siteName: 'Đất Sạch Tam Nông',
      slogan: 'Nông nghiệp - Nông dân - Nông thôn',
      contactEmail: 'datcsachtamnong@gmail.com',
      contactPhone: '0867.68.68.69',
      address: '121/1 ấp Thạnh Mỹ, xã Quới Điền, tỉnh Vĩnh Long',
      factory: 'Nhà máy sản xuất: Ấp An Nhơn 2, xã Mỏ Cày, tỉnh Vĩnh Long',
      socialMedia: {
        facebook: 'https://facebook.com/datsachtamnong',
        zalo: 'https://zalo.me/0867686869',
        instagram: ''
      },
      seo: {
        metaTitle: 'Đất Sạch Tam Nông - Đất hữu cơ chất lượng cao',
        metaDescription: 'Đất sạch dinh dưỡng Tam Nông - Sử dụng trực tiếp tốt cho mọi loại cây trồng. Tơi xốp, thoát nước tốt, giàu hữu cơ.'
      }
    });

    console.log('✅ Settings created successfully!');
    console.log(settings);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding settings:', error);
    process.exit(1);
  }
};

seedSettings();
