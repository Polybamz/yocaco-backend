import express from 'express';
import adminAuthController from '../../controller/auth_constroller/admin_controller.js';
import { protect, adminOnly } from '../../middleware/auth.js';
const router = express.Router();

// public — used by the admin dashboard login page
router.post('/login', adminAuthController.login);

// admin-only
router.post('/createAdmin', protect, adminOnly, adminAuthController.createAdminUser);
router.get('/getAllAdminUsers', protect, adminOnly, adminAuthController.getAllAdminUsers);
router.get('/getAdminUserById/:id', protect, adminOnly, async (req, res) => {
    const adminId = req.params.id;
    const user = await adminAuthController.getAdminUserById(adminId);
    res.status(200).json(user);
});

export default router;
