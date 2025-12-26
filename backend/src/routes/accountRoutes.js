const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const {
  createAccount,
  getAccounts,
  updateAccount,
  deleteAccount
} = require('../controllers/accountController');

const router = express.Router();

router.post('/', protect, createAccount);
router.get('/', protect, getAccounts);
router.put('/:id', protect, updateAccount);
router.delete('/:id', protect, deleteAccount);

module.exports = router;
