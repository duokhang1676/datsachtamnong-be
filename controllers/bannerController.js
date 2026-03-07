const Banner = require('../models/Banner');

// @desc    Get all banners
// @route   GET /api/banners
// @access  Public
exports.getBanners = async (req, res) => {
  try {
    const banners = await Banner.find().sort({ order: 1, createdAt: -1 });

    res.json({
      success: true,
      count: banners.length,
      data: banners
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single banner
// @route   GET /api/banners/:id
// @access  Public
exports.getBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy banner'
      });
    }

    res.json({
      success: true,
      data: banner
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create new banner
// @route   POST /api/banners
// @access  Private/Admin
exports.createBanner = async (req, res) => {
  try {
    const banner = await Banner.create(req.body);

    res.status(201).json({
      success: true,
      data: banner
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update banner
// @route   PUT /api/banners/:id
// @access  Private/Admin
exports.updateBanner = async (req, res) => {
  try {
    let banner = await Banner.findById(req.params.id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy banner'
      });
    }

    banner = await Banner.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({
      success: true,
      data: banner
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete banner
// @route   DELETE /api/banners/:id
// @access  Private/Admin
exports.deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy banner'
      });
    }

    await banner.deleteOne();

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

// @desc    Update banner order
// @route   PUT /api/banners/reorder
// @access  Private/Admin
exports.reorderBanners = async (req, res) => {
  try {
    const { banners } = req.body; // Array of { id, order }

    if (!banners || !Array.isArray(banners)) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp danh sách banners'
      });
    }

    // Update order for each banner
    const updatePromises = banners.map(item =>
      Banner.findByIdAndUpdate(item.id, { order: item.order })
    );

    await Promise.all(updatePromises);

    res.json({
      success: true,
      message: 'Đã cập nhật thứ tự banner'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
