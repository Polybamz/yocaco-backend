import express from 'express';
import TestimonialController from '../../controller/content_management/testiminials_controller/testimonials_controller.js';
import { protect } from '../../middleware/auth.js';
const router = express.Router();

/// public read
router.get('/get-testimonials', TestimonialController.getTestimonials);

/// authenticated mutations
router.post('/create-testimonials', protect, TestimonialController.addTestimonial);
router.delete('/delete-testimonials/:id', protect, TestimonialController.deleteTestimonials)
router.put('/update-testimonials/:id', protect, TestimonialController.updateTestimonials);


export default router;
