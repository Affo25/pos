const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const {
  createCustomer,
  getCustomers,
  updateCustomer,
  deleteCustomer
} = require('../controllers/customerController');

const router = express.Router();

router.post('/', protect, createCustomer);
router.get('/', protect, getCustomers);
router.put('/:id', protect, updateCustomer);
router.delete('/:id', protect, deleteCustomer);

module.exports = router;
