const Order = require('../models/Order');
const Product = require('../models/Product');
const Customer = require('../models/Customer');

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
exports.getOrders = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20, startDate, endDate } = req.query;

    // Build query
    let query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'customer.name': { $regex: search, $options: 'i' } },
        { 'customer.phone': { $regex: search, $options: 'i' } }
      ];
    }

    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const orders = await Order.find(query)
      .populate('items.product', 'name images')
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .skip(skip);

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      count: orders.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      data: orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product', 'name images')
      .populate('statusHistory.updatedBy', 'name');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Public
exports.createOrder = async (req, res) => {
  try {
    const { customer, items, shippingFee, paymentMethod, note } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Giỏ hàng trống'
      });
    }

    // Validate products and build order items
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Không tìm thấy sản phẩm ${item.product}`
        });
      }

      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.images[0]?.url || '',
        quantity: item.quantity
      });
    }

    // Calculate total from request (frontend should calculate)
    let totalAmount = req.body.totalAmount || 0;

    const finalAmount = totalAmount + (shippingFee || 0);

    // Create order
    const order = await Order.create({
      customer,
      items: orderItems,
      totalAmount,
      shippingFee: shippingFee || 0,
      finalAmount,
      paymentMethod: paymentMethod || 'cod',
      note
    });

    // Create customer record if doesn't exist (for newsletter/contact purposes)
    try {
      const customerExists = await Customer.findOne({ email: customer.email });
      
      if (!customerExists) {
        await Customer.create({
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          source: 'checkout'
        });
      }
    } catch (customerError) {
      console.error('Error creating customer:', customerError);
    }

    res.status(201).json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }

    order.status = status;
    
    // Add to status history
    order.statusHistory.push({
      status,
      note,
      updatedBy: req.user._id
    });

    // Update specific dates
    if (status === 'delivered') {
      order.deliveredAt = new Date();
    } else if (status === 'cancelled') {
      order.cancelledAt = new Date();
      if (note) order.cancelReason = note;
    }

    await order.save();

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update order
// @route   PUT /api/orders/:id
// @access  Private/Admin
exports.updateOrder = async (req, res) => {
  try {
    let order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }

    order = await Order.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete order
// @route   DELETE /api/orders/:id
// @access  Private/Admin
exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }

    await order.deleteOne();

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

// @desc    Get order statistics
// @route   GET /api/orders/stats/dashboard
// @access  Private/Admin
exports.getOrderStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(today.getDate() - today.getDay());

    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    // Total orders
    const totalOrders = await Order.countDocuments();
    
    // Today's orders
    const todayOrders = await Order.countDocuments({
      createdAt: { $gte: today }
    });

    // This week's orders
    const weekOrders = await Order.countDocuments({
      createdAt: { $gte: thisWeekStart }
    });

    // This month's orders
    const monthOrders = await Order.countDocuments({
      createdAt: { $gte: thisMonthStart }
    });

    // Revenue
    const revenueData = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$finalAmount' }
        }
      }
    ]);

    const totalRevenue = revenueData[0]?.totalRevenue || 0;

    // Status breakdown
    const statusStats = await Order.aggregate([
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
        totalOrders,
        todayOrders,
        weekOrders,
        monthOrders,
        totalRevenue,
        statusStats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
