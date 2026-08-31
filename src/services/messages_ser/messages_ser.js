import { db, admin } from '../../config/config.js';

class MessagesSer {
    // Find an existing conversation between the two participants, or create one.
    // Participants are stored sorted so the pair is order-independent.
    static async findOrCreateConversation(participantIds) {
        const [a, b] = [...new Set(participantIds)].sort();
        const existing = await db
            .collection('conversations')
            .where('participants', '==', [a, b])
            .limit(1)
            .get();

        if (!existing.empty) {
            const doc = existing.docs[0];
            return { id: doc.id, ...doc.data() };
        }

        const data = {
            participants: [a, b],
            lastMessage: '',
            unread: {},
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };
        const ref = await db.collection('conversations').add(data);
        return { id: ref.id, ...data };
    }

    static async listConversations() {
        const snap = await db.collection('conversations').orderBy('updatedAt', 'desc').get();
        return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    }

    static async getConversation(id) {
        const doc = await db.collection('conversations').doc(id).get();
        if (!doc.exists) return null;
        return { id: doc.id, ...doc.data() };
    }

    // No composite index needed: filter by conversation, then sort in memory.
    static async listMessages(conversationId) {
        const snap = await db
            .collection('messages')
            .where('conversationId', '==', conversationId)
            .get();
        return snap.docs
            .map((doc) => ({ id: doc.id, ...doc.data() }))
            .sort((a, b) => (a.createdAt?.toMillis?.() ?? 0) - (b.createdAt?.toMillis?.() ?? 0));
    }

    static async sendMessage(conversationId, senderId, text) {
        const conv = await this.getConversation(conversationId);
        if (!conv) throw new Error('Conversation not found');

        await db.collection('messages').add({
            conversationId,
            senderId,
            text,
            readBy: [senderId],
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        await db.collection('conversations').doc(conversationId).update({
            lastMessage: text,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        return this.listMessages(conversationId);
    }
}

export default MessagesSer;
