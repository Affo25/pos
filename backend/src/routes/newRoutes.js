const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const {
  createNew,
  getNews,
  updateNew,
  deleteNew
} = require('../controllers/newController');

const router = express.Router();

router.post('/', protect, createNew);
router.get('/', protect, getNews);
router.put('/:id', protect, updateNew);
router.delete('/:id', protect, deleteNew);

module.exports = router;
