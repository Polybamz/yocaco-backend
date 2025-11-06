import SubscriptionService from '../../services/subscription_ser/subscription_ser.js';


class SubscriptionController {
    async createSubscription(req, res) {
        try {
            const subscriptionData = req.body;
            // calculate enddate from startdate and duration
            const startDate = new Date(subscriptionData.startDate);
            const duration = subscriptionData.duration;
            const endDate = new Date(startDate.getTime() + duration * 24 * 60 * 60 * 1000);
            subscriptionData.endDate = endDate;
            const subscription = await SubscriptionService.createSubscription({subscriptionData});
            res.status(201).json({
                message: "Subscription created successfully",
                subscription
            });
        } catch (error) {
            res.status(500).json({
                message: "Error creating subscription",
                error
            });
        }
    }
}

export default new SubscriptionController();