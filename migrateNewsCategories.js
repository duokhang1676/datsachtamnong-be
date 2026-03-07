const mongoose = require('mongoose');
const News = require('./models/News');
const Category = require('./models/Category');
require('dotenv').config();

// Category name mapping from old enum to new categories
const categoryMapping = {
  'Kiến thức nông nghiệp': 'kien-thuc-nong-nghiep',
  'Tin tức': 'tin-tuc',
  'Hướng dẫn': 'huong-dan',
  'Khuyến mãi': 'khuyen-mai',
  'Khác': 'khac'
};

const migrateNewsCategories = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Get all news
    const allNews = await News.find({});
    console.log(`📰 Found ${allNews.length} news items to migrate`);

    let updated = 0;
    let skipped = 0;

    for (const news of allNews) {
      // Check if category is already ObjectId
      if (mongoose.Types.ObjectId.isValid(news.category) && news.category instanceof mongoose.Types.ObjectId) {
        console.log(`⏭️  Skipped: "${news.title}" - already migrated`);
        skipped++;
        continue;
      }

      // Get category string value
      const categoryString = news.category.toString();
      const categorySlug = categoryMapping[categoryString];

      if (!categorySlug) {
        console.log(`⚠️  Warning: No mapping for category "${categoryString}" in news "${news.title}"`);
        continue;
      }

      // Find category by slug
      const category = await Category.findOne({ slug: categorySlug, type: 'news' });

      if (!category) {
        console.log(`❌ Error: Category with slug "${categorySlug}" not found for news "${news.title}"`);
        continue;
      }

      // Update news category to ObjectId
      await News.updateOne(
        { _id: news._id },
        { $set: { category: category._id } }
      );

      console.log(`✅ Updated: "${news.title}" - ${categoryString} → ${category.name}`);
      updated++;
    }

    console.log('\n📊 Migration Summary:');
    console.log(`   ✅ Updated: ${updated}`);
    console.log(`   ⏭️  Skipped: ${skipped}`);
    console.log(`   📰 Total: ${allNews.length}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

migrateNewsCategories();
