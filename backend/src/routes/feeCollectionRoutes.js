const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const {
  createFeeCollection,
  getFeeCollections,
  updateFeeCollection,
  deleteFeeCollection
} = require('../controllers/feeCollectionController');

const router = express.Router();

router.post('/', protect, createFeeCollection);
router.get('/', protect, getFeeCollections);
router.put('/:id', protect, updateFeeCollection);
router.delete('/:id', protect, deleteFeeCollection);

module.exports = router;
