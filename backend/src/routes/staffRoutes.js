const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const {
  createStaff,
  getStaffs,
  updateStaff,
  deleteStaff
} = require('../controllers/staffController');

const router = express.Router();

router.post('/', protect, createStaff);
router.get('/', protect, getStaffs);
router.put('/:id', protect, updateStaff);
router.delete('/:id', protect, deleteStaff);

module.exports = router;
