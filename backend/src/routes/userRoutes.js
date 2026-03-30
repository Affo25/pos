const express = require('express');
const router = express.Router();
const {
    loginUser,
    logoutUser,
    getAllUsers,
    createUser,
    updateUser,
    deleteUser,
    changePassword,
    checkSubscriptionStatus,
    validateLicenseKey,
    getUserProfile,
    toggleUserBlock,
    updateLicenseStatus
} = require('../controllers/userController');
const { protect, checkRole } = require('../middlewares/authMiddleware');

// Public routes
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.post('/validate-license', validateLicenseKey);

// Protected routes (require authentication)
router.get('/profile', protect, getUserProfile); // You need to add this function
router.post('/change-password', protect, changePassword);
router.get('/subscription-status', protect, checkSubscriptionStatus);

// Admin only routes (require authentication + admin/superAdmin role)
router.get('/', protect, checkRole(['superAdmin', 'admin']), getAllUsers);
router.post('/', protect, checkRole(['superAdmin', 'admin']), createUser);
router.put('/:id', protect, checkRole(['superAdmin', 'admin']), updateUser); // Added protect here
router.delete('/:id', protect, checkRole(['superAdmin', 'admin']), deleteUser);

// SuperAdmin/Admin user management routes
router.put('/:id/block', protect, checkRole(['superAdmin', 'admin']), toggleUserBlock);
router.put('/:id/license-status', protect, checkRole(['superAdmin', 'admin']), updateLicenseStatus);

module.exports = router;