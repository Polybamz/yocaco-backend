import express from 'express';
import PaymentService from '../../services/payment/payment_ser.js';
import subscription_ser from '../../services/subscription_ser/subscription_ser.js';
import { protect } from '../../middleware/auth.js';

const router = express.Router();
const paymentService = new PaymentService();

// Initiate Payment (authenticated)
router.post('/initiate-payment', protect, async (req, res) => {
  const { type, paymentData, meta, subsData } = req.body;
  console.log(subsData);
  // Carry the employer id through to the webhook so the subscription is only
  // granted after Flutterwave confirms the charge.
  const enrichedMeta = { ...(meta || {}), employerId: (subsData && subsData.employerId) || (meta && meta.employerId) };
  const response = await paymentService.initiatePayment(type, paymentData, enrichedMeta);
  await subscription_ser.createSubscription(subsData);

  res.status(200).json({ message: 'Payment initiated successfully', response });
});

// Public — Flutterwave calls this to confirm transactions
router.post('/webhook/flutterwave', (req, res) =>
  paymentService.handleWebhook(req, res)
);

export default router;
