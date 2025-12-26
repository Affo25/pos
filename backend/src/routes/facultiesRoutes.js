const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const {
  createfaculties,
  getfaculties,
  updatefaculties,
  deletefaculties
} = require('../controllers/facultiesController');

const router = express.Router();

router.post('/', protect, createfaculties);
router.get('/', protect, getfaculties);
router.put('/:id', protect, updatefaculties);
router.delete('/:id', protect, deletefaculties);

module.exports = router;
