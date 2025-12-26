const express = require('express');
const router = express.Router();
// const { protect } = require('../middlewares/authMiddleware');
const {
    createEntity,
    getAllEntities,
    getEntityById,
    updateEntity,
    deleteEntity
} = require('../controllers/entityController');

router.post('/', createEntity);
router.get('/', getAllEntities);
router.get('/:id', getEntityById);
router.put('/:id', updateEntity);
router.delete('/:id', deleteEntity);

module.exports = router;
