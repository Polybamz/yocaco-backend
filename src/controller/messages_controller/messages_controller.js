import MessagesSer from '../../services/messages_ser/messages_ser.js';

class MessagesController {
    // { userId } — start (or resume) a conversation between the current admin and that user.
    static async createConversation(req, res) {
        try {
            const { userId } = req.body;
            if (!userId) {
                return res.status(400).json({ message: 'userId is required' });
            }
            const adminId = req.user.uid;
            const conversation = await MessagesSer.findOrCreateConversation([adminId, userId]);
            return res.status(201).json({ conversation });
        } catch (error) {
            return res.status(500).json({ message: 'Failed to create conversation', error: error.message });
        }
    }

    static async getConversations(req, res) {
        try {
            const conversations = await MessagesSer.listConversations();
            return res.status(200).json({ conversations });
        } catch (error) {
            return res.status(500).json({ message: 'Failed to fetch conversations', error: error.message });
        }
    }

    static async getMessages(req, res) {
        try {
            const { id } = req.params;
            const messages = await MessagesSer.listMessages(id);
            return res.status(200).json({ messages });
        } catch (error) {
            return res.status(500).json({ message: 'Failed to fetch messages', error: error.message });
        }
    }

    static async sendMessage(req, res) {
        try {
            const { id } = req.params;
            const { text } = req.body;
            if (!text || !String(text).trim()) {
                return res.status(400).json({ message: 'Message text is required' });
            }
            const messages = await MessagesSer.sendMessage(id, req.user.uid, text);
            return res.status(201).json({ messages });
        } catch (error) {
            const status = error.message === 'Conversation not found' ? 404 : 500;
            return res.status(status).json({ message: error.message, error: error.message });
        }
    }
}

export default MessagesController;
