const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const {
  createFeeStructures,
  getFeeStructuress,
  updateFeeStructures,
  deleteFeeStructures
} = require('../controllers/feeStructuresController');

const router = express.Router();

router.post('/', protect, createFeeStructures);
router.get('/', protect, getFeeStructuress);
router.put('/:id', protect, updateFeeStructures);
router.delete('/:id', protect, deleteFeeStructures);

module.exports = router;
