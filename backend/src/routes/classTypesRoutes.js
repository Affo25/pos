const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const {
  createClassTypes,
  getClassTypes,
  updateClassTypes,
  deleteClassTypes
} = require('../controllers/classTypesController');

const router = express.Router();

router.post('/', protect, createClassTypes);
router.get('/', protect, getClassTypes);
router.put('/:id', protect, updateClassTypes);
router.delete('/:id', protect, deleteClassTypes);

module.exports = router;
