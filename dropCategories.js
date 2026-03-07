const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const dropCategoriesCollection = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    
    // Drop the categories collection (this will also drop all indexes)
    try {
      await db.collection('categories').drop();
      console.log('✅ Dropped categories collection and all its indexes');
    } catch (error) {
      if (error.message.includes('ns not found')) {
        console.log('ℹ️  Categories collection does not exist yet');
      } else {
        throw error;
      }
    }

    console.log('\nYou can now run seedCategories.js to create fresh categories');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

dropCategoriesCollection();
