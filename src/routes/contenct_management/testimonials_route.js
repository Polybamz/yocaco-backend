import express from 'express';
import TestimonialController from '../../controller/content_management/testiminials_controller/testimonials_controller.js';
const router = express.Router();



router.post('/create-testimonials', TestimonialController.addTestimonial);
router.get('/get-testimonials', TestimonialController.getTestimonials);
router.delete('/delete-testimonials/:id', TestimonialController.deleteTestimonials)
router.put('update-testimonials/:id', TestimonialController.updateTestimonials);


export default router;