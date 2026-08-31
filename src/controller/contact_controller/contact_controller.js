import ContactService from '../../services/contact_ser/contact_ser.js'
import { contactMessageSchema, contactUpdateSchema } from '../../model/contact_model/contact_model.js'

class ContactController {
  // Public — used by the contact form on the public site
  static async createMessage(req, res) {
    try {
      const { error, value } = contactMessageSchema.validate(req.body, {
        abortEarly: false,
      })
      if (error) {
        return res.status(400).json({
          message: 'Invalid contact form data',
          errors: error.details.map((d) => d.message),
        })
      }
      const message = await ContactService.createMessage(value)
      return res.status(201).json({
        message: 'Message sent successfully',
        data: message,
      })
    } catch (err) {
      return res.status(500).json({
        message: 'Failed to send message',
        error: err.message,
      })
    }
  }

  // Admin — dashboard inbox
  static async getMessages(req, res) {
    try {
      const messages = await ContactService.getAllMessages()
      return res.status(200).json({ messages })
    } catch (err) {
      return res.status(500).json({
        message: 'Failed to fetch contact messages',
        error: err.message,
      })
    }
  }

  // Admin — mark read / unread
  static async markMessage(req, res) {
    try {
      const { error, value } = contactUpdateSchema.validate(req.body)
      if (error) {
        return res.status(400).json({ message: error.details[0].message })
      }
      const updated = await ContactService.markAsRead(req.params.id, value.isRead)
      if (!updated) {
        return res.status(404).json({ message: 'Contact message not found' })
      }
      return res.status(200).json({ message: 'Contact message updated', data: updated })
    } catch (err) {
      return res.status(500).json({
        message: 'Failed to update contact message',
        error: err.message,
      })
    }
  }

  // Admin — remove a message
  static async deleteMessage(req, res) {
    try {
      await ContactService.deleteMessage(req.params.id)
      return res.status(200).json({ message: 'Contact message deleted' })
    } catch (err) {
      return res.status(500).json({
        message: 'Failed to delete contact message',
        error: err.message,
      })
    }
  }
}

export default ContactController