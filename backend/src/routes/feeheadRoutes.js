const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const {
  createfeehead,
  getfeeheads,
  updatefeehead,
  deletefeehead
} = require('../controllers/feeheadController');

const router = express.Router();

router.post('/', protect, createfeehead);
router.get('/', protect, getfeeheads);
router.put('/:id', protect, updatefeehead);
router.delete('/:id', protect, deletefeehead);

module.exports = router;
