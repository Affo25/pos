const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const {
  createClassAttendance,
  getClassAttendances,
  updateClassAttendance,
  deleteClassAttendance,
  getClassAttendanceSummary
} = require('../controllers/classAttendanceController');

const router = express.Router();

router.post('/', protect, createClassAttendance);
router.get('/', protect, getClassAttendances);
router.put('/:id', protect, updateClassAttendance);
router.delete('/:id', protect, deleteClassAttendance);
router.get('/summary', protect, getClassAttendanceSummary);


module.exports = router;
