const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const {
  createNotice,
  getNotices,
  updateNotice,
  deleteNotice
} = require('../controllers/noticeController');

const router = express.Router();

router.post('/', protect, createNotice);
router.get('/', protect, getNotices);
router.put('/:id', protect, updateNotice);
router.delete('/:id', protect, deleteNotice);

module.exports = router;
