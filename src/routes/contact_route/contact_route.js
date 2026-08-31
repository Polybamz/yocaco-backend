import express from 'express'
import ContactController from '../../controller/contact_controller/contact_controller.js'
import { protect, adminOnly } from '../../middleware/auth.js'

const router = express.Router()

// public — contact form on the public site
router.post('/send', ContactController.createMessage)

// admin-only — contact inbox for the dashboard
router.get('/messages', protect, adminOnly, ContactController.getMessages)
router.put('/messages/:id/read', protect, adminOnly, ContactController.markMessage)
router.delete('/messages/:id', protect, adminOnly, ContactController.deleteMessage)

export default router