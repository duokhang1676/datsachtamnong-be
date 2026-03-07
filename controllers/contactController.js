const Contact = require('../models/Contact');
const Customer = require('../models/Customer');

// @desc    Get all contacts
// @route   GET /api/contacts
// @access  Private/Admin
exports.getContacts = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;

    // Build query
    let query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const contacts = await Contact.find(query)
      .populate('repliedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .skip(skip);

    const total = await Contact.countDocuments(query);

    res.json({
      success: true,
      count: contacts.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      data: contacts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single contact
// @route   GET /api/contacts/:id
// @access  Private/Admin
exports.getContact = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id)
      .populate('repliedBy', 'name email');

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy liên hệ'
      });
    }

    // Mark as read if it's new
    if (contact.status === 'new') {
      contact.status = 'read';
      await contact.save();
    }

    res.json({
      success: true,
      data: contact
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create new contact
// @route   POST /api/contacts
// @access  Public
exports.createContact = async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    // Create contact
    const contact = await Contact.create({
      name,
      email,
      phone,
      message,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    // Also create/update customer record for newsletter management
    try {
      const existingCustomer = await Customer.findOne({ email });
      
      if (!existingCustomer) {
        // Create new customer from contact
        await Customer.create({
          name,
          email,
          phone: phone || '',
          source: 'contact',
          note: `Liên hệ: ${message.substring(0, 200)}${message.length > 200 ? '...' : ''}`,
          ipAddress: req.ip,
          status: 'active'
        });
      } else if (existingCustomer.source === 'contact' || existingCustomer.source === 'manual') {
        // Update existing customer note with new contact message
        existingCustomer.note = `${existingCustomer.note ? existingCustomer.note + '\n\n' : ''}Liên hệ mới: ${message.substring(0, 200)}${message.length > 200 ? '...' : ''}`;
        if (!existingCustomer.phone && phone) {
          existingCustomer.phone = phone;
        }
        await existingCustomer.save();
      }
      // If customer exists from footer/checkout, don't update to avoid overwriting
    } catch (customerError) {
      // Log error but don't fail the contact creation
      console.error('Failed to sync customer:', customerError);
    }

    res.status(201).json({
      success: true,
      message: 'Cảm ơn bạn đã liên hệ. Chúng tôi sẽ phản hồi sớm nhất có thể.',
      data: contact
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update contact status
// @route   PUT /api/contacts/:id/status
// @access  Private/Admin
exports.updateContactStatus = async (req, res) => {
  try {
    const { status, replyNote } = req.body;
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy liên hệ'
      });
    }

    contact.status = status;

    if (status === 'replied') {
      contact.repliedAt = new Date();
      contact.repliedBy = req.user._id;
      if (replyNote) {
        contact.replyNote = replyNote;
      }
    }

    await contact.save();

    res.json({
      success: true,
      data: contact
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete contact
// @route   DELETE /api/contacts/:id
// @access  Private/Admin
exports.deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy liên hệ'
      });
    }

    await contact.deleteOne();

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

// @desc    Get contact statistics
// @route   GET /api/contacts/stats/dashboard
// @access  Private/Admin
exports.getContactStats = async (req, res) => {
  try {
    // Total contacts
    const totalContacts = await Contact.countDocuments();
    
    // Status breakdown
    const newContacts = await Contact.countDocuments({ status: 'new' });
    const readContacts = await Contact.countDocuments({ status: 'read' });
    const repliedContacts = await Contact.countDocuments({ status: 'replied' });

    res.json({
      success: true,
      data: {
        totalContacts,
        newContacts,
        readContacts,
        repliedContacts
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
