// In your main server file (e.g., server.js or app.js)
const express = require('express');
const bodyParser = require('body-parser');
import PaymentService from '../../services/payment/payment_ser';
import dotenv from 'dotenv';
dotenv.config();
const app = express();
const PaymentService = require('./PaymentService'); // Assuming PaymentService.js

const paymentService = new PaymentService();

// You need to get the secret hash from your Flutterwave dashboard
const FLUTTERWAVE_SECRET_HASH = process.env.FLW_SECRET_HASH;

// Use a raw body parser to verify the webhook signature
app.use(bodyParser.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));

// Webhook endpoint
app.post('/webhook', async (req, res) => {
  const hash = req.headers['verif-hash'];

  // 1. Verify the signature
  if (!hash || hash !== FLUTTERWAVE_SECRET_HASH) {
    // This isn't a valid request from Flutterwave
    return res.status(401).send('Unauthorized');
  }

  const payload = req.body;
  const event = payload.event;
  const data = payload.data;

  // 2. Handle the specific events
  if (event === 'charge.completed' || event === 'mobilemoney.completed') {
    const transactionId = data.id;
    const status = data.status;

    // Use the verifyTransaction method from your PaymentService
    const verification = await paymentService.verifyTransaction(transactionId);
    
    // 3. Process the transaction and update your database
    if (verification && verification.status === 'success') {
      // The transaction is verified and successful.
      // Update your order/user status in the database.
      console.log(`Successfully verified and processed transaction ${transactionId}.`);
    } else {
      // The transaction failed or couldn't be verified.
      console.log(`Failed to verify or process transaction ${transactionId}. Status: ${status}`);
    }
  }

  res.status(200).end();
});

// Start your server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});