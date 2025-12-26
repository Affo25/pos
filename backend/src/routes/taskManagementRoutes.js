const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/upload');
const {
  createTaskManagement,
  getTaskManagements,
  updateTaskManagement,
  deleteTaskManagement
} = require('../controllers/taskManagementController');

const router = express.Router();

const uploadTasks = upload("tasks");

router.post('/', protect, uploadTasks.array('taskImage', 5), createTaskManagement);
router.get('/', protect, getTaskManagements);
router.put('/:id', protect, uploadTasks.array('taskImage', 5), updateTaskManagement);
router.delete('/:id', protect, deleteTaskManagement);

module.exports = router;
