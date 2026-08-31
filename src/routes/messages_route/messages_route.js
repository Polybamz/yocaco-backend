import express from 'express';
import MessagesController from '../../controller/messages_controller/messages_controller.js';
import { protect, adminOnly } from '../../middleware/auth.js';

const router = express.Router();

// Admin inbox — all endpoints require an authenticated admin.
router.post('/conversations', protect, adminOnly, MessagesController.createConversation);
router.get('/conversations', protect, adminOnly, MessagesController.getConversations);
router.get('/conversations/:id/messages', protect, adminOnly, MessagesController.getMessages);
router.post('/conversations/:id/messages', protect, adminOnly, MessagesController.sendMessage);

export default router;
