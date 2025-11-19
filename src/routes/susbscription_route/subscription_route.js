import express from 'express';
import SubscriptionService from '../../services/subscription_ser/subscription_ser.js';
import SubscriptionController from '../../controller/subscription_controller/subscription_controller.js';

const router = express.Router();
import { Job, scheduleJob } from 'node-schedule';
// subscribe

router.post('/subscribe', SubscriptionController.createSubscription)
// get subscription

router.get('/subscription', SubscriptionController.getAllSubscriptions)
// update subscription status

// delet subscription
router.delete('/delete-subscription/:id', SubscriptionController.deleteSubscription)
// update subscription status
router.put('/subscription/:userId/:status', SubscriptionController.updateUserSubscription )

// update users subscription status

router.put('/subscription-ss/:userID', SubscriptionController.updateSubscription)

// router.put('/subscription/status', SubscriptionController.updateSubscriptionStatus)

const job = scheduleJob('* * * * *', async ()=> {
    console.log('updating subscription status')
    await SubscriptionService.updateExpiredSubscrition()
})



export default router