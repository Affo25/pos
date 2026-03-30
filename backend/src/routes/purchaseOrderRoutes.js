const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const {
  createPurchaseOrder,
  getPurchaseOrders,
  updatePurchaseOrder,
  deletePurchaseOrder
} = require('../controllers/purchaseOrderController');

const router = express.Router();

router.post('/', protect, createPurchaseOrder);
router.get('/', protect, getPurchaseOrders);
router.put('/:id', protect, updatePurchaseOrder);
router.delete('/:id', protect, deletePurchaseOrder);

module.exports = router;
