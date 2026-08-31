import { db } from '../../config/config.js'

class ContactService {
  // Public: a visitor submits the contact form
  async createMessage(data) {
    try {
      const payload = {
        ...data,
        isRead: false,
        createdAt: new Date().toISOString(),
      }
      const ref = db.collection('contact_messages').doc()
      await ref.set(payload)
      return { id: ref.id, ...payload }
    } catch (error) {
      throw new Error('Error creating contact message: ' + error.message)
    }
  }

  // Admin: list newest first
  async getAllMessages() {
    try {
      const snapshot = await db
        .collection('contact_messages')
        .orderBy('createdAt', 'desc')
        .get()
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    } catch (error) {
      throw new Error('Error getting contact messages: ' + error.message)
    }
  }

  async markAsRead(id, isRead) {
    try {
      const ref = db.collection('contact_messages').doc(id)
      await ref.update({ isRead })
      const doc = await ref.get()
      if (!doc.exists) return null
      return { id: doc.id, ...doc.data() }
    } catch (error) {
      throw new Error('Error updating contact message: ' + error.message)
    }
  }

  async deleteMessage(id) {
    try {
      const ref = db.collection('contact_messages').doc(id)
      await ref.delete()
      return { id }
    } catch (error) {
      throw new Error('Error deleting contact message: ' + error.message)
    }
  }
}

export default new ContactService()