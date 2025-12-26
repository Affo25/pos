const express = require('express');
const router = express.Router();
const {
    createElement,
    getAllElements,
    getElementsByPage,
    getElementById,
    updateElement,
    deleteElement
} = require('../controllers/pageElementController');

router.post('/', createElement);
router.get('/', getAllElements);
router.get('/page/:pageId', getElementsByPage);
router.get('/:id', getElementById);
router.put('/:id', updateElement);
router.delete('/:id', deleteElement);

module.exports = router;