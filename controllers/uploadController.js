const cloudinary = require('../config/cloudinary');

// @desc    Upload single image
// @route   POST /api/upload/image
// @access  Private/Admin
exports.uploadImage = async (req, res) => {
  try {
    if (!req.body.image) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng chọn ảnh'
      });
    }

    // Get folder from request or default to 'products'
    const folder = req.body.folder || 'products';
    const cloudinaryFolder = `datsachtamnong/${folder}`;

    // Upload to cloudinary
    const result = await cloudinary.uploader.upload(req.body.image, {
      folder: cloudinaryFolder,
      resource_type: 'image',
      transformation: [
        { width: 2000, height: 2000, crop: 'limit' },
        { quality: 90 },
        { fetch_format: 'auto' }
      ]
    });

    res.json({
      success: true,
      data: {
        url: result.secure_url,
        publicId: result.public_id
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Upload multiple images
// @route   POST /api/upload/images
// @access  Private/Admin
exports.uploadImages = async (req, res) => {
  try {
    if (!req.body.images || !Array.isArray(req.body.images)) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng chọn ảnh'
      });
    }

    // Get folder from request or default to 'products'
    const folder = req.body.folder || 'products';
    const cloudinaryFolder = `datsachtamnong/${folder}`;

    const uploadPromises = req.body.images.map(image =>
      cloudinary.uploader.upload(image, {
        folder: cloudinaryFolder,
        resource_type: 'image',
        transformation: [
          { width: 2000, height: 2000, crop: 'limit' },
          { quality: 90 },
          { fetch_format: 'auto' }
        ]
      })
    );

    const results = await Promise.all(uploadPromises);

    const images = results.map(result => ({
      url: result.secure_url,
      publicId: result.public_id
    }));

    res.json({
      success: true,
      data: images
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete image
// @route   DELETE /api/upload/image/:publicId
// @access  Private/Admin
exports.deleteImage = async (req, res) => {
  try {
    const { publicId } = req.params;

    if (!publicId) {
      return res.status(400).json({
        success: false,
        message: 'Public ID is required'
      });
    }

    // Delete from cloudinary
    await cloudinary.uploader.destroy(publicId);

    res.json({
      success: true,
      message: 'Đã xóa ảnh thành công'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
