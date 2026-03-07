const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');
const Category = require('./models/Category');

dotenv.config();

// Mapping from old enum values to new category names
const categoryMapping = {
  'organic-soil': 'Đất hữu cơ',
  'fertilizer': 'Phân bón',
  'tools': 'Dụng cụ làm vườn',
  'seeds': 'Hạt giống',
  'other': 'Khác'
};

const migrateProductCategories = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('Connected to MongoDB');

    // Get all categories
    const categories = await Category.find({ type: 'product' });
    console.log(`Found ${categories.length} product categories`);

    // Create a map of category name to ID
    const categoryMap = {};
    categories.forEach(cat => {
      categoryMap[cat.name] = cat._id;
    });

    console.log('\nCategory mapping:');
    Object.entries(categoryMap).forEach(([name, id]) => {
      console.log(`- ${name}: ${id}`);
    });

    // Get all products
    const products = await Product.find({});
    console.log(`\nFound ${products.length} products to migrate`);

    let migratedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const product of products) {
      try {
        // Check if category is already an ObjectId
        if (mongoose.Types.ObjectId.isValid(product.category) && 
            typeof product.category === 'object') {
          console.log(`⏭️  Skipped: "${product.name}" - already migrated`);
          skippedCount++;
          continue;
        }

        // Get the old category value
        const oldCategory = product.category;
        
        // Map to new category name
        const categoryName = categoryMapping[oldCategory];
        
        if (!categoryName) {
          console.log(`⚠️  Warning: "${product.name}" has unknown category "${oldCategory}" - setting to "Khác"`);
          product.category = categoryMap['Khác'];
        } else {
          product.category = categoryMap[categoryName];
        }

        await product.save({ validateBeforeSave: false });
        console.log(`✅ Migrated: "${product.name}" (${oldCategory} → ${categoryName || 'Khác'})`);
        migratedCount++;
      } catch (error) {
        console.error(`❌ Error migrating "${product.name}":`, error.message);
        errorCount++;
      }
    }

    console.log('\n=== MIGRATION SUMMARY ===');
    console.log(`✅ Successfully migrated: ${migratedCount}`);
    console.log(`⏭️  Skipped (already migrated): ${skippedCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`📊 Total processed: ${products.length}`);

    if (migratedCount > 0) {
      console.log('\n✅ Migration completed successfully!');
    } else if (skippedCount === products.length) {
      console.log('\n✅ All products already migrated!');
    } else {
      console.log('\n⚠️  Migration completed with issues. Please review the logs.');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1);
  }
};

migrateProductCategories();
