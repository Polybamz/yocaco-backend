import express from 'express';
import NewsletterController from '../../controller/newsletter_controller/newsletter_controller.js';
import { protect, adminOnly } from '../../middleware/auth.js';

const router = express.Router();

// public — used by the newsletter signup form on the public site
router.post('/subscribe', NewsletterController.subscribe);

// admin-only — dashboard Newsletter management page
router.get('/subscribers', protect, adminOnly, NewsletterController.getSubscribers);
router.post('/remove', protect, adminOnly, NewsletterController.remove);

export default router;
