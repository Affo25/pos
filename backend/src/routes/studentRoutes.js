const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const {
  createStudent,
  getStudents,
  updateStudent,
  deleteStudent
} = require('../controllers/studentController');

const router = express.Router();

router.post('/', protect, createStudent);
router.get('/', protect, getStudents);
router.put('/:id', protect, updateStudent);
router.delete('/:id', protect, deleteStudent);

module.exports = router;
