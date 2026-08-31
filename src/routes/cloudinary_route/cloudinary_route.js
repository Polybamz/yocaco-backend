import express from 'express';
const router = express.Router();
import CloudinaryController from '../../controller/coudinary/cloudinay_controller.js';
import { protect } from '../../middleware/auth.js';

// authenticated mutation
router.delete('/delete-image/:public_id', protect, CloudinaryController.deleteImage);

export default router;
