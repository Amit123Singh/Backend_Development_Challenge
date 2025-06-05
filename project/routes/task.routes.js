const express = require('express');
const { check } = require('express-validator');
const { 
  getTasks, 
  getTask, 
  createTask, 
  updateTask, 
  deleteTask 
} = require('../controllers/task.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', protect, getTasks);
router.get('/:id', protect, getTask);

router.post(
  '/', 
  [
    protect,
    authorize('Manager'),
    check('title', 'Title is required').not().isEmpty(),
    check('description', 'Description is required').not().isEmpty(),
    check('assignedTo', 'AssignedTo is required').not().isEmpty(),
    check('dueDate', 'Due date is required').not().isEmpty()
  ],
  createTask
);

router.put('/:id', protect, updateTask);
router.delete('/:id', protect, authorize('Manager'), deleteTask);

module.exports = router;