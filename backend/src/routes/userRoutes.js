const express = require('express');
const router = express.Router();
const {
    loginUser,
    logoutUser,
    getAllUsers,
    createUser,
    updateUser,
    deleteUser
} = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get('/', protect, getAllUsers);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;
