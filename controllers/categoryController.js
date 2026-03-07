const Category = require('../models/Category');
const Product = require('../models/Product');
const News = require('../models/News');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
exports.getCategories = async (req, res) => {
  try {
    const { type, isActive, search } = req.query;

    // Build query
  let query = {};

  if (type) {
    query.type = type;
  }

  if (isActive !== undefined) {
    query.isActive = isActive === 'true';
  }

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  const categories = await Category.find(query).sort({ order: 1, name: 1 });

  res.status(200).json({
    success: true,
    count: categories.length,
    data: categories
  });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Public
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

  if (!category) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy danh mục'
    });
  }

  res.status(200).json({
    success: true,
    data: category
  });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get category by slug
// @route   GET /api/categories/slug/:slug
// @access  Public
exports.getCategoryBySlug = async (req, res) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug });

  if (!category) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy danh mục'
    });
  }

  res.status(200).json({
    success: true,
    data: category
  });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create category
// @route   POST /api/categories
// @access  Private/Admin
exports.createCategory = async (req, res) => {
  try {
    const { name, description, image, type, order, isActive } = req.body;

  // Check if category already exists
  const existingCategory = await Category.findOne({ name, type });
  if (existingCategory) {
    return res.status(400).json({
      success: false,
      message: 'Danh mục này đã tồn tại'
    });
  }

  const category = await Category.create({
    name,
    description,
    image,
    type,
    order,
    isActive
  });

  res.status(201).json({
    success: true,
    data: category,
    message: 'Đã tạo danh mục thành công'
  });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private/Admin
exports.updateCategory = async (req, res) => {
  try {
    let category = await Category.findById(req.params.id);

  if (!category) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy danh mục'
    });
  }

  // Check if new name already exists (if name is being changed)
  if (req.body.name && req.body.name !== category.name) {
    const existingCategory = await Category.findOne({ 
      name: req.body.name, 
      type: category.type,
      _id: { $ne: req.params.id }
    });
    
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Tên danh mục này đã tồn tại'
      });
    }
  }

  category = await Category.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  );

  res.status(200).json({
    success: true,
    data: category,
    message: 'Đã cập nhật danh mục thành công'
  });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

  if (!category) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy danh mục'
    });
  }

  // Check if category is being used by products
  if (category.type === 'product') {
    const Product = require('../models/Product');
    const productsUsingCategory = await Product.countDocuments({ category: req.params.id });
    
    if (productsUsingCategory > 0) {
      return res.status(400).json({
        success: false,
        message: `Không thể xóa danh mục này vì đang có ${productsUsingCategory} sản phẩm sử dụng`
      });
    }
  }

  // Check if category is being used by news
  if (category.type === 'news') {
    const News = require('../models/News');
    const newsUsingCategory = await News.countDocuments({ category: category.name });
    
    if (newsUsingCategory > 0) {
      return res.status(400).json({
        success: false,
        message: `Không thể xóa danh mục này vì đang có ${newsUsingCategory} bài viết sử dụng`
      });
    }
  }

  await category.deleteOne();

  res.status(200).json({
    success: true,
    data: {},
    message: 'Đã xóa danh mục thành công'
  });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get category stats
// @route   GET /api/categories/stats/dashboard
// @access  Private/Admin
exports.getCategoryStats = async (req, res) => {
  try {
    const { type } = req.query;

  let query = {};
  if (type) {
    query.type = type;
  }

  const totalCategories = await Category.countDocuments(query);
  const activeCategories = await Category.countDocuments({ ...query, isActive: true });
  const inactiveCategories = await Category.countDocuments({ ...query, isActive: false });

  const byType = await Category.aggregate([
    { $group: { _id: '$type', count: { $sum: 1 } } }
  ]);

  res.status(200).json({
    success: true,
    data: {
      total: totalCategories,
      active: activeCategories,
      inactive: inactiveCategories,
      byType
    }
  });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
