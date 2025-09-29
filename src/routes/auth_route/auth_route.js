import userAuthController from '../../controller/auth_constroller/user_auth_controller.js';
import express from 'express';
const router = express.Router();

router.post('/register', userAuthController.createUser);
router.post('/login', userAuthController.loginUser);
router.get('/logout', userAuthController.logoutUser);
router.post('/createAdmin', userAuthController.createAdmin);
router.put('/updateUser/:id', userAuthController.updateUser);

export default router;
