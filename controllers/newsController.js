const News = require('../models/News');

// In-memory tracking for article views (IP + Article ID)
// Structure: Map<articleId_ipAddress, timestamp>
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
const shouldIncrementView = (articleId, req) => {
  // Get client IP address
  const clientIp = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for']?.split(',')[0];
  const trackKey = `${articleId}_${clientIp}`;
  
  // Check if this IP has viewed this article in the last 24 hours
  const lastViewTime = viewTracker.get(trackKey);
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
  
  if (!lastViewTime || lastViewTime < oneDayAgo) {
    // Record this view
    viewTracker.set(trackKey, Date.now());
    return true;
  }
  
  return false;
};

// @desc    Get all news
// @route   GET /api/news
// @access  Public
exports.getNews = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 10, isActive } = req.query;

    // Build query
    let query = {};

    // Filter by category
    if (category && category !== 'all') {
      query.category = category;
    }

    // Filter by active status
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    // Search
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const news = await News.find(query)
      .populate('author', 'name email')
      .populate('category', 'name slug')
      .sort({ publishedAt: -1, createdAt: -1 })
      .limit(limitNum)
      .skip(skip);

    const total = await News.countDocuments(query);

    res.json({
      success: true,
      count: news.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      data: news
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single news by ID
// @route   GET /api/news/:id
// @access  Public
exports.getNewsById = async (req, res) => {
  try {
    const news = await News.findById(req.params.id)
      .populate('author', 'name email')
      .populate('category', 'name slug');

    if (!news) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài viết'
      });
    }

    // Increment views based on IP tracking (once per 24 hours per IP)
    if (shouldIncrementView(news._id.toString(), req)) {
      news.views += 1;
      await news.save();
    }

    res.json({
      success: true,
      data: news
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get news by slug
// @route   GET /api/news/slug/:slug
// @access  Public
exports.getNewsBySlug = async (req, res) => {
  try {
    const news = await News.findOne({ slug: req.params.slug })
      .populate('author', 'name email');

    if (!news) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài viết'
      });
    }

    // Increment views based on IP tracking (once per 24 hours per IP)
    if (shouldIncrementView(news._id.toString(), req)) {
      news.views += 1;
      await news.save();
    }

    res.json({
      success: true,
      data: news
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create news
// @route   POST /api/news
// @access  Private/Admin
exports.createNews = async (req, res) => {
  try {
    const {
      title,
      content,
      excerpt,
      featuredImage,
      category,
      tags,
      isActive,
      publishedAt
    } = req.body;

    // Validate required fields
    if (!title || !content || !category) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập đầy đủ thông tin: tiêu đề, nội dung và danh mục'
      });
    }

    // Check if user is authenticated
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: 'Vui lòng đăng nhập để tạo bài viết'
      });
    }

    const newsData = {
      title,
      content,
      excerpt,
      featuredImage,
      category,
      tags: tags || [],
      isActive: isActive !== undefined ? isActive : true,
      publishedAt: publishedAt || Date.now(),
      author: req.user._id
    };

    const news = await News.create(newsData);

    const populatedNews = await News.findById(news._id)
      .populate('author', 'name email')
      .populate('category', 'name slug');

    res.status(201).json({
      success: true,
      data: populatedNews,
      message: 'Tạo bài viết thành công'
    });
  } catch (error) {
    console.error('Error creating news:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi tạo bài viết'
    });
  }
};

// @desc    Update news
// @route   PUT /api/news/:id
// @access  Private/Admin
exports.updateNews = async (req, res) => {
  try {
    let news = await News.findById(req.params.id);

    if (!news) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài viết'
      });
    }

    const {
      title,
      content,
      excerpt,
      featuredImage,
      category,
      tags,
      isActive,
      publishedAt
    } = req.body;

    // Update fields
    if (title !== undefined) news.title = title;
    if (content !== undefined) news.content = content;
    if (excerpt !== undefined) news.excerpt = excerpt;
    if (featuredImage !== undefined) news.featuredImage = featuredImage;
    if (category !== undefined) news.category = category;
    if (tags !== undefined) news.tags = tags;
    if (isActive !== undefined) news.isActive = isActive;
    if (publishedAt !== undefined) news.publishedAt = publishedAt;

    await news.save();

    res.json({
      success: true,
      data: news,
      message: 'Cập nhật bài viết thành công'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete news
// @route   DELETE /api/news/:id
// @access  Private/Admin
exports.deleteNews = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);

    if (!news) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài viết'
      });
    }

    await news.deleteOne();

    res.json({
      success: true,
      data: {},
      message: 'Đã xóa bài viết'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get news statistics
// @route   GET /api/news/stats/dashboard
// @access  Private/Admin
exports.getNewsStats = async (req, res) => {
  try {
    const total = await News.countDocuments();
    const active = await News.countDocuments({ isActive: true });
    const inactive = await News.countDocuments({ isActive: false });

    // News by category
    const byCategory = await News.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    // Most viewed
    const mostViewed = await News.find()
      .sort({ views: -1 })
      .limit(5)
      .select('title views slug');

    res.json({
      success: true,
      data: {
        total,
        active,
        inactive,
        byCategory,
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
