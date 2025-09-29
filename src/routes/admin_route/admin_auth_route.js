import express from 'express';
import adminAuthController from '../../controller/auth_constroller/admin_controller.js';
const router = express.Router();

router.post('/login', adminAuthController.login);
router.post('/createAdmin', adminAuthController.createAdminUser);
router.get('/getAllAdminUsers', adminAuthController.getAllAdminUsers);
router.get('/getAdminUserById/:id', async (req, res) => {
    const adminId = req.params.id;
    const user = await adminAuthController.getAdminUserById(adminId);
    res.status(200).json(user);
});

export default router;