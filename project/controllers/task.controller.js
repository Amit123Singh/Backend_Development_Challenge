const Task = require('../models/Task');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Private (Manager: all tasks, Employee: only assigned tasks)
exports.getTasks = async (req, res, next) => {
  try {
    let tasks;
    
    if (req.user.role === 'Manager') {
      // Managers can see all tasks
      tasks = await Task.find()
        .populate('assignedTo', 'name email')
        .populate('createdBy', 'name email');
    } else {
      // Employees can see only their assigned tasks
      tasks = await Task.find({ assignedTo: req.user.id })
        .populate('assignedTo', 'name email')
        .populate('createdBy', 'name email');
    }

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
exports.getTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    // Check if user is authorized to view this task
    if (
      req.user.role !== 'Manager' &&
      task.assignedTo.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this task'
      });
    }

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create task
// @route   POST /api/tasks
// @access  Private (Managers only)
exports.createTask = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    // Check if assigned user exists and is an employee
    const assignedUser = await User.findById(req.body.assignedTo);
    if (!assignedUser || assignedUser.role !== 'Employee') {
      return res.status(400).json({
        success: false,
        error: 'Invalid user assignment. Must assign to an employee'
      });
    }

    // Add current user as creator
    req.body.createdBy = req.user.id;

    const task = await Task.create(req.body);

    // Populate the references for the response
    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    // Send socket notification to the assigned user
    const io = req.app.get('io');
    io.to(req.body.assignedTo).emit('newTask', {
      task: populatedTask,
      message: 'You have been assigned a new task'
    });

    res.status(201).json({
      success: true,
      data: populatedTask
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private (Manager: all fields, Employee: only status)
exports.updateTask = async (req, res, next) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    // Check permissions
    if (req.user.role === 'Employee') {
      // Employees can only update status of their assigned tasks
      if (task.assignedTo.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to update this task'
        });
      }

      // Employees can only update the status field
      if (Object.keys(req.body).some(key => key !== 'status')) {
        return res.status(403).json({
          success: false,
          error: 'Employees can only update the status field'
        });
      }
    }

    // Update task
    task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    // Send notification about the update
    const io = req.app.get('io');
    
    // Notify the manager
    io.to('Manager').emit('taskUpdated', {
      task,
      message: `Task "${task.title}" has been updated`
    });
    
    // Notify the assigned employee if they aren't the one updating it
    if (req.user.id !== task.assignedTo.toString()) {
      io.to(task.assignedTo.toString()).emit('taskUpdated', {
        task,
        message: `Task "${task.title}" has been updated`
      });
    }

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private (Managers only)
exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    await task.deleteOne();

    // Notify the assigned employee
    const io = req.app.get('io');
    io.to(task.assignedTo.toString()).emit('taskDeleted', {
      taskId: task._id,
      message: `Task "${task.title}" has been deleted`
    });

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};