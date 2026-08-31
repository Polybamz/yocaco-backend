import NewsletterSer from '../../services/newsletter_ser/newsletter_ser.js';

class NewsletterController {
    static async subscribe(req, res) {
        try {
            const { email } = req.body;
            if (!email || !String(email).trim()) {
                return res.status(400).json({ message: 'Email is required' });
            }
            await NewsletterSer.addSubscriber(email);
            return res.status(201).json({ message: 'Subscribed successfully' });
        } catch (error) {
            const status = error.response?.status === 400 ? 400 : 500;
            return res.status(status).json({
                message: 'Failed to subscribe',
                error: error.response?.data?.detail || error.message,
            });
        }
    }

    static async getSubscribers(req, res) {
        try {
            const members = await NewsletterSer.listSubscribers();
            return res.status(200).json({ subscribers: members });
        } catch (error) {
            return res.status(500).json({ message: 'Failed to fetch subscribers', error: error.message });
        }
    }

    static async remove(req, res) {
        try {
            const { email } = req.body;
            if (!email || !String(email).trim()) {
                return res.status(400).json({ message: 'Email is required' });
            }
            await NewsletterSer.removeSubscriber(email);
            return res.status(200).json({ message: 'Subscriber removed' });
        } catch (error) {
            return res.status(500).json({ message: 'Failed to remove subscriber', error: error.message });
        }
    }
}

export default NewsletterController;
