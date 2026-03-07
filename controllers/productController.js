const Product = require('../models/Product');

// In-memory tracking for product views (IP + Product ID)
// Structure: Map<productId_ipAddress, timestamp>
const viewTracker = new Map();

// Clean up old entries every hour
setInterval(() => {
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
  for (const [key, timestamp] of viewTracker.entries()) {
    if (timestamp < oneDayAgo) {
      viewTracker.delete(key);
    }
  }
}, 60 * 60 * 1000); // Run every hour

// Helper function to check and track view
const shouldIncrementView = (productId, req) => {
  // Get client IP address
  const clientIp = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for']?.split(',')[0];
  const trackKey = `${productId}_${clientIp}`;
  
  // Check if this IP has viewed this product in the last 24 hours
  const lastViewTime = viewTracker.get(trackKey);
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
  
  if (!lastViewTime || lastViewTime < oneDayAgo) {
    // Record this view
    viewTracker.set(trackKey, Date.now());
    return true;
  }
  
  return false;
};

// @desc    Get all products
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res) => {
  try {
    const { category, search, sort, page = 1, limit = 12, featured } = req.query;

    // Build query
    let query = { isActive: true };

    if (category && category !== 'all') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (featured === 'true') {
      query.isFeatured = true;
    }

    // Sorting
    let sortOptions = { createdAt: -1 };
    if (sort) {
      switch (sort) {
        case 'price-asc':
          sortOptions = { price: 1 };
          break;
        case 'price-desc':
          sortOptions = { price: -1 };
          break;
        case 'name-asc':
          sortOptions = { name: 1 };
          break;
        case 'popular':
          sortOptions = { sold: -1, 'rating.average': -1 };
          break;
        default:
          sortOptions = { createdAt: -1 };
      }
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const products = await Product.find(query)
      .populate('category')
      .sort(sortOptions)
      .limit(limitNum)
      .skip(skip);

    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      count: products.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm'
      });
    }

    // Increment views based on IP tracking (once per 24 hours per IP)
    if (shouldIncrementView(product._id.toString(), req)) {
      product.views += 1;
      await product.save();
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get product by slug
// @route   GET /api/products/slug/:slug
// @access  Public
exports.getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug, isActive: true }).populate('category');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm'
      });
    }

    // Increment views based on IP tracking (once per 24 hours per IP)
    if (shouldIncrementView(product._id.toString(), req)) {
      product.views += 1;
      await product.save();
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private/Admin
exports.createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);

    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
exports.updateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm'
      });
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('category');

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm'
      });
    }

    await product.deleteOne();

    res.json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get product stats
// @route   GET /api/products/stats/dashboard
// @access  Private/Admin
exports.getProductStats = async (req, res) => {
  try {
    const total = await Product.countDocuments();
    const active = await Product.countDocuments({ isActive: true });
    const inactive = await Product.countDocuments({ isActive: false });
    
    // Total views across all products
    const totalViewsResult = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalViews: { $sum: '$views' }
        }
      }
    ]);
    const totalViews = totalViewsResult.length > 0 ? totalViewsResult[0].totalViews : 0;

    // Products by category
    const byCategory = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    // Most viewed products
    const mostViewed = await Product.find()
      .sort({ views: -1 })
      .limit(5)
      .select('name views slug')
      .populate('category', 'name');

    // Products by status
    const byStatus = await Product.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        total,
        active,
        inactive,
        totalViews,
        byCategory,
        byStatus,
        mostViewed
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Add product review
// @route   POST /api/products/:id/reviews
// @access  Private
exports.addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id).populate('category');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm'
      });
    }

    // Check if already reviewed
    const alreadyReviewed = product.reviews.find(
      r => r.user && r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      return res.status(400).json({
        success: false,
        message: 'Bạn đã đánh giá sản phẩm này'
      });
    }

    const review = {
      user: req.user._id,
      name: req.user.name,
      rating: Number(rating),
      comment
    };

    product.reviews.push(review);
    product.rating.count = product.reviews.length;
    product.rating.average =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    await product.save();

    res.status(201).json({
      success: true,
      message: 'Đã thêm đánh giá'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
