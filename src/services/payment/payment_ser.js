import dotenv from 'dotenv';
import { db, admin } from '../../config/config.js'; // Firestore config
import Flutterwave from 'flutterwave-node-v3';

dotenv.config();

const flw = new Flutterwave(
  process.env.FLW_PUBLIC_KEY,
  process.env.FLW_SECRET_KEY
);

class PaymentService {
  constructor(firestore = db) {
    this.db = firestore.collection('payments');
  }

  _addMeta(paymentData, meta) {
    return { ...paymentData, meta: { ...paymentData.meta, ...meta } };
  }

  /**
   * Initialize a payment — supports various types
   * @param {'card'|'bank_transfer'|'ussd'|'mobilemoney'|'orangemoney'|'airtellmoney'|'mobilemoneygh'|'mpesa'|'mobilemoneyfranco'} type
   * @param {object} paymentData
   * @param {object} meta
   */
  async initiatePayment(type, paymentData, meta = {}) {
    try {
      const data = this._addMeta(paymentData, meta);
      const method = flw.Charge[type];

      if (!method) throw new Error(`Unsupported payment type: ${type}`);

      const response = await method(data);

      // ✅ Save initial payment record to Firestore
      await this.db.doc(data.tx_ref).set({
        txRef: data.tx_ref,
        amount: data.amount,
        currency: data.currency || 'XAF',
        type,
        status: 'PENDING',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        meta,
      });

      return response;
    } catch (error) {
      console.error(`Error initiating ${type} payment:`, error.message);
      throw new Error('Payment initiation failed.');
    }
  }

  async verifyTransaction(transactionId) {
    try {
      const response = await flw.Transaction.verify({ id: transactionId });
      return response;
    } catch (error) {
      console.error('Error verifying transaction:', error.message);
      throw new Error('Transaction verification failed.');
    }
  }

  /**
   * Flutterwave webhook handler.
   */
  async handleWebhook(req, res) {
    const secretHash = process.env.FLW_SECRET_HASH;
    const signature = req.headers['verif-hash'];

    if (!signature || signature !== secretHash) {
      console.warn('Unauthorized webhook attempt');
      return res.status(401).send('Unauthorized');
    }

    const event = req.body;
    const { id, tx_ref, status, amount, currency, meta } = event.data;

    try {
      const paymentRef = this.db.doc(tx_ref);

      if (event.event === 'charge.completed' && status === 'successful') {
        // ✅ Update successful payment
        await paymentRef.update({
          status: 'SUCCESS',
          transactionId: id,
          amount,
          currency,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        console.log(`✅ Payment successful for ${tx_ref}`);
      } else if (status === 'failed') {
        // ❌ Mark failed payment
        await paymentRef.update({
          status: 'FAILED',
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        console.warn(`❌ Payment failed for ${tx_ref}`);
      }

      res.status(200).send('Webhook received');
    } catch (error) {
      console.error('Error processing webhook:', error.message);
      res.status(500).send('Internal webhook error');
    }
  }
}

export default PaymentService;
