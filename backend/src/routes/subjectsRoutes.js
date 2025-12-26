const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const {
  createSubjects,
  getSubjectss,
  updateSubjects,
  deleteSubjects
} = require('../controllers/subjectsController');

const router = express.Router();

router.post('/', protect, createSubjects);
router.get('/', protect, getSubjectss);
router.put('/:id', protect, updateSubjects);
router.delete('/:id', protect, deleteSubjects);

module.exports = router;
