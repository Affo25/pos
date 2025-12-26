const express = require('express');
const {
    createPageData,
    getPageData,
    updatePageData,
    deletePageData
} = require('../controllers/pageDataController');

const router = express.Router();

router.post('/', createPageData);
router.get('/', getPageData);
router.put('/:id', updatePageData);
router.delete('/:id', deletePageData);

module.exports = router;

