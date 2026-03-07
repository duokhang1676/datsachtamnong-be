const Customer = require('../models/Customer');

// @desc    Get all customers
// @route   GET /api/customers
// @access  Private/Admin
exports.getCustomers = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20, source } = req.query;

    // Build query
    let query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (source && source !== 'all') {
      query.source = source;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const customers = await Customer.find(query)
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .skip(skip);

    const total = await Customer.countDocuments(query);

    res.json({
      success: true,
      count: customers.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      data: customers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single customer
// @route   GET /api/customers/:id
// @access  Private/Admin
exports.getCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy khách hàng'
      });
    }

    res.json({
      success: true,
      data: customer
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create new customer (subscribe)
// @route   POST /api/customers
// @access  Public
exports.createCustomer = async (req, res) => {
  try {
    const { name, email, phone, source } = req.body;

    // Check if customer already exists
    const existingCustomer = await Customer.findOne({ email });
    
    if (existingCustomer) {
      if (existingCustomer.status === 'unsubscribed') {
        // Reactivate
        existingCustomer.status = 'active';
        existingCustomer.subscribedAt = new Date();
        existingCustomer.unsubscribedAt = null;
        await existingCustomer.save();

        return res.json({
          success: true,
          message: 'Đã kích hoạt lại đăng ký',
          data: existingCustomer
        });
      }

      return res.status(400).json({
        success: false,
        message: 'Email đã được đăng ký'
      });
    }

    // Create new customer
    const customer = await Customer.create({
      name,
      email,
      phone,
      source: source || 'manual',
      ipAddress: req.ip
    });

    res.status(201).json({
      success: true,
      message: 'Đăng ký thành công',
      data: customer
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update customer
// @route   PUT /api/customers/:id
// @access  Private/Admin
exports.updateCustomer = async (req, res) => {
  try {
    let customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy khách hàng'
      });
    }

    // If changing to unsubscribed, set date
    if (req.body.status === 'unsubscribed' && customer.status !== 'unsubscribed') {
      req.body.unsubscribedAt = new Date();
    }

    customer = await Customer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({
      success: true,
      data: customer
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete customer
// @route   DELETE /api/customers/:id
// @access  Private/Admin
exports.deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy khách hàng'
      });
    }

    await customer.deleteOne();

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

// @desc    Unsubscribe customer
// @route   PUT /api/customers/:id/unsubscribe
// @access  Public
exports.unsubscribeCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy khách hàng'
      });
    }

    customer.status = 'unsubscribed';
    customer.unsubscribedAt = new Date();
    await customer.save();

    res.json({
      success: true,
      message: 'Đã hủy đăng ký thành công'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get customer statistics
// @route   GET /api/customers/stats/dashboard
// @access  Private/Admin
exports.getCustomerStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastWeekStart = new Date(today);
    lastWeekStart.setDate(today.getDate() - 7);

    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(today.getDate() - today.getDay());

    // Total customers
    const total = await Customer.countDocuments();
    
    // Active customers
    const active = await Customer.countDocuments({ status: 'active' });
    
    // Unsubscribed customers
    const unsubscribed = await Customer.countDocuments({ status: 'unsubscribed' });

    // This week's new customers
    const thisWeek = await Customer.countDocuments({
      createdAt: { $gte: thisWeekStart }
    });

    // Last week's new customers
    const lastWeek = await Customer.countDocuments({
      createdAt: { $gte: lastWeekStart, $lt: thisWeekStart }
    });

    // Calculate percentage change
    let weeklyChange = 0;
    if (lastWeek > 0) {
      weeklyChange = ((thisWeek - lastWeek) / lastWeek) * 100;
    } else if (thisWeek > 0) {
      weeklyChange = 100;
    }

    // Source breakdown
    const sourceStats = await Customer.aggregate([
      {
        $group: {
          _id: '$source',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        total,
        active,
        unsubscribed,
        thisWeek,
        lastWeek,
        weeklyChange: Math.round(weeklyChange * 10) / 10,
        sourceStats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
