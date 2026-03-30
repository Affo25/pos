const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const {
  createSupplier,
  getSuppliers,
  updateSupplier,
  deleteSupplier
} = require('../controllers/supplierController');

const router = express.Router();

router.post('/', protect, createSupplier);
router.get('/', protect, getSuppliers);
router.put('/:id', protect, updateSupplier);
router.delete('/:id', protect, deleteSupplier);

module.exports = router;
