const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const {
  createProducts,
  getProductss,
  updateProducts,
  deleteProducts
} = require('../controllers/productsController');

const router = express.Router();

router.post('/', protect, createProducts);
router.get('/', protect, getProductss);
router.put('/:id', protect, updateProducts);
router.delete('/:id', protect, deleteProducts);

module.exports = router;
