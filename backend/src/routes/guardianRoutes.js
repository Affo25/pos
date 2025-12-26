const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const {
  createGuardian,
  getGuardians,
  updateGuardian,
  deleteGuardian
} = require('../controllers/guardianController');

const router = express.Router();

router.post('/', protect, createGuardian);
router.get('/', protect, getGuardians);
router.put('/:id', protect, updateGuardian);
router.delete('/:id', protect, deleteGuardian);

module.exports = router;
