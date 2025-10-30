import express from 'express';
const router = express.Router();
import CloudinaryController from '../../controller/coudinary/cloudinay_controller.js';

router.delete('/delete-image/:public_id', CloudinaryController.deleteImage);

export default router;