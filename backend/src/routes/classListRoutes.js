const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const {
  createClassList,
  getClassLists,
  updateClassList,
  deleteClassList
} = require('../controllers/classListController');

const router = express.Router();

router.post('/', protect, createClassList);
router.get('/', protect, getClassLists);
router.put('/:id', protect, updateClassList);
router.delete('/:id', protect, deleteClassList);

module.exports = router;
