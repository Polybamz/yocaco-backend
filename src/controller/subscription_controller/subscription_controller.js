import SubscriptionService from '../../services/subscription_ser/subscription_ser.js';


class SubscriptionController {
  static  async createSubscription(req, res) {
        try {
            const subscriptionData = req.body;
            console.log(subscriptionData);
            // calculate enddate from startdate and duration
            const startDate = new Date(subscriptionData.startDate);
            const duration = subscriptionData.duration;
            const endDate = new Date(startDate.getTime() + duration * 24 * 60 * 60 * 1000).toISOString();
            subscriptionData.endDate = endDate;
            const subscription = await SubscriptionService.createSubscription({...subscriptionData});
            res.status(201).json({
                message: "Subscription created successfully",
                subscription
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({
                message: "Error creating subscription",
                error
            });
        }
    }
    /// get all subscriptions
    static async getAllSubscriptions(req, res) {
        try {
            const subscriptions = await SubscriptionService.getAllSubscriptions();
            res.status(200).json({
                message: "All subscriptions fetched successfully",
                subscriptions
            });
        } catch (error) {
            res.status(500).json({
                message: "Error fetching subscriptions",
                error
            });
        }
    }
    /// delete a subscription
    static async deleteSubscription(req, res) {
        try {
            const subscriptionId = req.params.id;
            const subscription = await SubscriptionService.deleteSubscription(subscriptionId);
            if (subscription) {
                res.status(200).json({
                    message: "Subscription deleted successfully",
                    subscription
                });
            } else {
                res.status(404).json({
                    message: "Subscription not found"
                });
            }
        } catch (error) {
            res.status(500).json({
                message: "Error deleting subscription",
                error
            });
        }
    }
    /// update a subscription
    static async updateSubscription(req, res) {
        try {
            const subscriptionId = req.params.id;
            const subscriptionData = req.body;
            const subscription = await SubscriptionService.updateSubscription(subscriptionId, subscriptionData);
            if (subscription) {
                res.status(200).json({
                    message: "Subscription updated successfully",
                    subscription
                });
            } else {
                res.status(404).json({
                    message: "Subscription not found"
                });
            }
        } catch (error) {
            res.status(500).json({
                message: "Error updating subscription",
                error
            });
        }z
    }
    // update user subscription
    static async updateUserSubscription(req, res) {
        try {
            const userId = req.params.userId;
            const status = req.params.status;
            console.log(userId, status)
            const subscription = await SubscriptionService.updateSubscriptionStatus(userId, status);
            if (subscription) {
                res.status(200).json({
                    message: "Subscription updated successfully",
                    subscription
                });
            } else {
                res.status(404).json({
                    message: "Subscription not found"
                });
            }
        } catch (error) {
            res.status(500).json({
                message: "Error updating subscription",
                error
            });
        }}


        // update status 
        static async updateStatus(req, res) {}

        /// get subscription by employerId
    static async getSubscriptionByEmployerId(req, res) {
        try {
            const employerId = req.params.employerId;
            const subscriptions = await SubscriptionService.getSubscriptionByEmployerId(employerId);
            if (subscriptions.length > 0) {
                res.status(200).json({
                    message: "Subscription fetched successfully",
                    subscriptions
                });
            } else {
                res.status(404).json({
                    message: "Subscription not found"
                });
            }
        } catch (error) {
            res.status(500).json({
                message: "Error fetching subscription",
                error
            });
        }
    }

        
        
}

export default  SubscriptionController;