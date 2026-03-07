const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Category = require('./models/Category');

dotenv.config();

// Product categories
const productCategories = [
  {
    name: 'Đất hữu cơ',
    description: 'Đất dinh dưỡng hữu cơ chất lượng cao cho mọi loại cây trồng',
    type: 'product',
    order: 1,
    isActive: true
  },
  {
    name: 'Phân bón',
    description: 'Phân bón hữu cơ và vi sinh giúp cây phát triển khỏe mạnh',
    type: 'product',
    order: 2,
    isActive: true
  },
  {
    name: 'Dụng cụ làm vườn',
    description: 'Công cụ và thiết bị hỗ trợ trồng trọt',
    type: 'product',
    order: 3,
    isActive: true
  },
  {
    name: 'Hạt giống',
    description: 'Hạt giống rau củ quả chất lượng cao',
    type: 'product',
    order: 4,
    isActive: true
  },
  {
    name: 'Khác',
    description: 'Các sản phẩm khác hỗ trợ nông nghiệp',
    type: 'product',
    order: 5,
    isActive: true
  }
];

// News categories
const newsCategories = [
  {
    name: 'Kiến thức nông nghiệp',
    description: 'Kiến thức và kỹ thuật canh tác hữu cơ',
    type: 'news',
    order: 1,
    isActive: true
  },
  {
    name: 'Tin tức',
    description: 'Tin tức mới nhất về nông nghiệp và môi trường',
    type: 'news',
    order: 2,
    isActive: true
  },
  {
    name: 'Hướng dẫn',
    description: 'Hướng dẫn trồng trọt và chăm sóc cây',
    type: 'news',
    order: 3,
    isActive: true
  },
  {
    name: 'Khuyến mãi',
    description: 'Thông tin về các chương trình khuyến mãi',
    type: 'news',
    order: 4,
    isActive: true
  },
  {
    name: 'Khác',
    description: 'Các bài viết khác',
    type: 'news',
    order: 5,
    isActive: true
  }
];

const seedCategories = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('Connected to MongoDB');

    // Clear existing categories
    await Category.deleteMany({});
    console.log('Cleared existing categories');

    // Insert product categories one by one to trigger pre-save hooks
    const createdProductCategories = [];
    for (const catData of productCategories) {
      const category = new Category(catData);
      await category.save();
      createdProductCategories.push(category);
    }
    console.log(`Created ${createdProductCategories.length} product categories`);

    // Insert news categories one by one to trigger pre-save hooks
    const createdNewsCategories = [];
    for (const catData of newsCategories) {
      const category = new Category(catData);
      await category.save();
      createdNewsCategories.push(category);
    }
    console.log(`Created ${createdNewsCategories.length} news categories`);

    console.log('\n=== PRODUCT CATEGORIES ===');
    createdProductCategories.forEach(cat => {
      console.log(`- ${cat.name} (${cat.slug}) [ID: ${cat._id}]`);
    });

    console.log('\n=== NEWS CATEGORIES ===');
    createdNewsCategories.forEach(cat => {
      console.log(`- ${cat.name} (${cat.slug}) [ID: ${cat._id}]`);
    });

    console.log('\n✅ Categories seeded successfully!');
    console.log('\nIMPORTANT: Update existing products to use these category IDs');
    console.log('Run the migration script to convert old category values to ObjectIds\n');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding categories:', error);
    process.exit(1);
  }
};

seedCategories();
