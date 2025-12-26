const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const {
  createNonAcademic,
  getNonAcademics,
  updateNonAcademic,
  deleteNonAcademic
} = require('../controllers/nonAcademicController');

const router = express.Router();

router.post('/', protect, createNonAcademic);
router.get('/', protect, getNonAcademics);
router.put('/:id', protect, updateNonAcademic);
router.delete('/:id', protect, deleteNonAcademic);

module.exports = router;
