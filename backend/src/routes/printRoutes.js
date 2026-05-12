const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const printController = require('../controllers/printController');

router.get('/printers', protect, printController.getPrinters);
router.post('/invoice', protect, printController.printInvoice);
router.post('/preview', protect, printController.previewInvoice);

module.exports = router;
