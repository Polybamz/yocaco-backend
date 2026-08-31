import express from 'express';
import SubscriptionService from '../../services/subscription_ser/subscription_ser.js';
import SubscriptionController from '../../controller/subscription_controller/subscription_controller.js';
import { protect } from '../../middleware/auth.js';
import { scheduleJob } from 'node-schedule';

const router = express.Router();

/// public read
/// get subscription
router.get('/subscription', SubscriptionController.getAllSubscriptions)
/// get subscription by employer id
router.get('/emloyer-subscription/:employerId', SubscriptionController.getSubscriptionByEmployerId)

/// authenticated mutations
/// subscribe
router.post('/subscribe', protect, SubscriptionController.createSubscription)
/// delete subscription
router.delete('/delete-subscription/:id', protect, SubscriptionController.deleteSubscription)
/// update subscription status
router.put('/subscription/:userId/:status', protect, SubscriptionController.updateUserSubscription)
/// update users subscription status
router.put('/subscription-ss/:userID', protect, SubscriptionController.updateSubscription)

// Update expired subscriptions daily.
// Guarded so it only schedules once even if this module is imported twice.
if (!global.__yocaco_subscription_expiry_scheduled) {
  global.__yocaco_subscription_expiry_scheduled = true;
  scheduleJob('0 3 * * *', async () => {
    console.log('updating subscription status');
    await SubscriptionService.updateExpiredSubscrition();
  });
}

export default router;
