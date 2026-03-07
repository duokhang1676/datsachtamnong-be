const Settings = require('../models/Settings');

// @desc    Get settings
// @route   GET /api/settings
// @access  Public
exports.getSettings = async (req, res) => {
  try {
    const settings = await Settings.getSingletonSettings();

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update settings
// @route   PUT /api/settings
// @access  Private/Admin
exports.updateSettings = async (req, res) => {
  try {
    const {
      siteName,
      slogan,
      logo,
      favicon,
      contactEmail,
      contactPhone,
      address,
      factory,
      socialMedia,
      seo
    } = req.body;

    let settings = await Settings.findOne();
    
    if (!settings) {
      settings = await Settings.create({
        siteName,
        slogan,
        logo,
        favicon,
        contactEmail,
        contactPhone,
        address,
        factory,
        socialMedia,
        seo,
        updatedBy: req.user._id
      });
    } else {
      // Update fields
      if (siteName !== undefined) settings.siteName = siteName;
      if (slogan !== undefined) settings.slogan = slogan;
      if (logo !== undefined) settings.logo = logo;
      if (favicon !== undefined) settings.favicon = favicon;
      if (contactEmail !== undefined) settings.contactEmail = contactEmail;
      if (contactPhone !== undefined) settings.contactPhone = contactPhone;
      if (address !== undefined) settings.address = address;
      if (factory !== undefined) settings.factory = factory;
      
      if (socialMedia) {
        settings.socialMedia = {
          facebook: socialMedia.facebook || settings.socialMedia.facebook,
          zalo: socialMedia.zalo || settings.socialMedia.zalo,
          instagram: socialMedia.instagram || settings.socialMedia.instagram
        };
      }
      
      if (seo) {
        settings.seo = {
          metaTitle: seo.metaTitle || settings.seo.metaTitle,
          metaDescription: seo.metaDescription || settings.seo.metaDescription
        };
      }

      settings.updatedBy = req.user._id;
      await settings.save();
    }

    res.json({
      success: true,
      data: settings,
      message: 'Cập nhật thông tin thành công'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Reset settings to default
// @route   POST /api/settings/reset
// @access  Private/Admin
exports.resetSettings = async (req, res) => {
  try {
    await Settings.deleteMany({});
    const settings = await Settings.create({
      updatedBy: req.user._id
    });

    res.json({
      success: true,
      data: settings,
      message: 'Đã khôi phục cài đặt mặc định'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
