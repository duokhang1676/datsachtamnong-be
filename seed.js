const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log('✅ MongoDB Connected');

    // Check if admin exists
    const adminExists = await User.findOne({ email: 'admin@datsachtamnong.com' });

    if (adminExists) {
      console.log('⚠️  Admin user already exists');
      process.exit();
    }

    // Create admin user
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@datsachtamnong.com',
      password: 'admin123456',
      role: 'admin'
    });

    console.log('✅ Admin user created successfully');
    console.log('📧 Email:', admin.email);
    console.log('🔑 Password: admin123456');
    console.log('⚠️  Please change the password after first login!');

    process.exit();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

seedAdmin();
