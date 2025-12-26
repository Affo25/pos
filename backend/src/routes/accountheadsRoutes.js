const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const {
  createAccountheads,
  getAccountheads,
  updateAccountheads,
  deleteAccountheads
} = require('../controllers/accountheadsController');

const router = express.Router();

router.post('/', protect, createAccountheads);
router.get('/', protect, getAccountheads);
router.put('/:id', protect, updateAccountheads);
router.delete('/:id', protect, deleteAccountheads);

module.exports = router;
