const User = require('../models/User');

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Managers only)
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password');
    
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get employees only
// @route   GET /api/users/employees
// @access  Private (Managers only)
exports.getEmployees = async (req, res, next) => {
  try {
    const employees = await User.find({ role: 'Employee' }).select('-password');
    
    res.status(200).json({
      success: true,
      count: employees.length,
      data: employees
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private (Managers only or own profile)
exports.getUser = async (req, res, next) => {
  try {
    // Check if user is authorized
    if (req.user.role !== 'Manager' && req.user.id !== req.params.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this user profile'
      });
    }

    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    next(err);
  }
};