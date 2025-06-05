const express = require('express');
const { getUsers, getUser, getEmployees } = require('../controllers/user.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', protect, authorize('Manager'), getUsers);
router.get('/employees', protect, authorize('Manager'), getEmployees);
router.get('/:id', protect, getUser);

module.exports = router;