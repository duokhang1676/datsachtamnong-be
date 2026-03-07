const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const resetAdminPassword = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');

    // Find admin user
    const admin = await User.findOne({ email: 'admin@datsachtamnong.com' });

    if (!admin) {
      console.log('❌ Admin user not found');
      console.log('Run seed.js to create admin user first');
      process.exit(1);
    }

    // Update password
    admin.password = 'admin123456';
    await admin.save();

    console.log('✅ Admin password reset successfully');
    console.log('📧 Email: admin@datsachtamnong.com');
    console.log('🔑 Password: admin123456');
    console.log('⚠️  Please change the password after login!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

resetAdminPassword();
