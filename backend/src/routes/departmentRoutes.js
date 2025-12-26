const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const {
  createDepartment,
  getDepartments,
  updateDepartment,
  deleteDepartment
} = require('../controllers/departmentController');

const router = express.Router();

router.post('/', protect, createDepartment);
router.get('/', protect, getDepartments);
router.put('/:id', protect, updateDepartment);
router.delete('/:id', protect, deleteDepartment);

module.exports = router;
