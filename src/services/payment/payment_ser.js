import dotenv from 'dotenv';
import { db, admin } from '../../config/config.js'; // Firestore config
import Flutterwave from 'flutterwave-node-v3';
import SubscriptionService from '../subscription_ser/subscription_ser.js';

dotenv.config();

const flw = new Flutterwave(
  process.env.FLW_PUBLIC_KEY,
  process.env.FLW_SECRET_KEY
);

// class PaymentService {
//   constructor(firestore = db) {
//     this.db = firestore.collection('payments');
//   }

//   _addMeta(paymentData, meta) {
//     return { ...paymentData, meta: { ...paymentData.meta, ...meta } };
//   }

//   /**
//    * Initialize a payment — supports various types
//    * @param {'card'|'bank_transfer'|'ussd'|'mobilemoney'|'orangemoney'|'airtellmoney'|'mobilemoneygh'|'mpesa'|'mobilemoneyfranco'} type
//    * @param {object} paymentData
//    * @param {object} meta
//    */
//   async initiatePayment(type, paymentData, meta = {}) {
//     console.log(`Initiating ${type} payment for ${paymentData.amount} ${paymentData.currency}`);
//     try {
//       const data = this._addMeta(paymentData, meta);
//       const method = flw.Charge[type];

//       if (!method) throw new Error(`Unsupported payment type: ${type}`);

//       const response = await method(data);

//       // ✅ Save initial payment record to Firestore
//       await this.db.doc(data.tx_ref).set({
//         txRef: data.tx_ref,
//         amount: data.amount,
//         currency: data.currency || 'XAF',
//         type,
//         status: 'PENDING',
//         createdAt: admin.firestore.FieldValue.serverTimestamp(),
//         meta,
//       });

//       return response;
//     } catch (error) {
//       console.error(`Error initiating ${type} payment:`, error.message);
//       throw new Error('Payment initiation failed.');
//     }
//   }

//   async verifyTransaction(transactionId) {
//     try {
//       const response = await flw.Transaction.verify({ id: transactionId });
//       return response;
//     } catch (error) {
//       console.error('Error verifying transaction:', error.message);
//       throw new Error('Transaction verification failed.');
//     }
//   }

//   /**
//    * Flutterwave webhook handler.
//    */
//   async handleWebhook(req, res) {
//     const secretHash = process.env.FLW_SECRET_HASH;
//     const signature = req.headers['verif-hash'];

//     if (!signature || signature !== secretHash) {
//       console.warn('Unauthorized webhook attempt');
//       return res.status(401).send('Unauthorized');
//     }

//     const event = req.body;
//     const { id, tx_ref, status, amount, currency, meta } = event.data;

//     try {
//       const paymentRef = this.db.doc(tx_ref);

//       if (event.event === 'charge.completed' && status === 'successful') {
//         // ✅ Update successful payment
//         await paymentRef.update({
//           status: 'SUCCESS',
//           transactionId: id,
//           amount,
//           currency,
//           updatedAt: admin.firestore.FieldValue.serverTimestamp(),
//         });

//         console.log(`✅ Payment successful for ${tx_ref}`);
//       } else if (status === 'failed') {
//         // ❌ Mark failed payment
//         await paymentRef.update({
//           status: 'FAILED',
//           updatedAt: admin.firestore.FieldValue.serverTimestamp(),
//         });

//         console.warn(`❌ Payment failed for ${tx_ref}`);
//       }

//       res.status(200).send('Webhook received');
//     } catch (error) {
//       console.error('Error processing webhook:', error.message);
//       res.status(500).send('Internal webhook error');
//     }
//   }
// }
// ...existing code...

class PaymentService {
  constructor(firestore = db) {
    this.db = firestore.collection('payments');
    // Map user-friendly types to Flutterwave API method names
    this.typeMap = {
      'mobilemoney': 'mobile_money',
      'mobilemoneygh': 'mobile_money_gh',
      'mobilemoneyfranco': 'mobile_money_franco',
      'orangemoney': 'orange_money',
      'airtellmoney': 'airtel_money',
      'mpesa': 'mpesa',
      'ussd': 'ussd',
      'bank_transfer': 'bank_transfer',
      'card': 'card',
    };
  }

  _addMeta(paymentData, meta) {
    return { ...paymentData, meta: { ...paymentData.meta, ...meta } };
  }

  async initiatePayment(type, paymentData, meta = {}) {
    console.log(`Initiating ${type} payment for ${paymentData.amount} ${paymentData.currency}`);
    try {
      const data = this._addMeta(paymentData, meta);

      // Map the type to Flutterwave method name
      const flwMethodName = this.typeMap[type];
      if (!flwMethodName) {
        throw new Error(`Unsupported payment type: ${type}`);
      }

      const method = flw.Charge[flwMethodName];
      if (!method) {
        throw new Error(`Flutterwave method not found: ${flwMethodName}`);
      }

      const response = await method(data);

      // Persist the initial payment record so the webhook can verify against it.
      // tx_ref doubles as the document id.
      const txRef = data.tx_ref || data.txref;
      if (!txRef) {
        throw new Error('paymentData.tx_ref is required to initiate a payment');
      }
      await this.db.doc(String(txRef)).set({
        txRef: String(txRef),
        amount: data.amount,
        currency: data.currency || 'XAF',
        type,
        status: 'PENDING',
        meta: data.meta || {},
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
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
   * Verifies the signature, records the payment outcome, and grants the
   * subscription ONLY on a confirmed successful charge.
   */
  async handleWebhook(req, res) {
    const secretHash = process.env.FLW_SECRET_HASH;
    const signature = req.headers['verif-hash'];

    if (!secretHash || !signature || signature !== secretHash) {
      console.warn('Unauthorized webhook attempt');
      return res.status(401).send('Unauthorized');
    }

    const event = req.body;
    const eventData = event && event.data ? event.data : {};
    const { id, tx_ref, status, amount, currency } = eventData;

    // Without a tx_ref there is nothing to update; acknowledge to stop retries.
    if (!tx_ref) {
      console.warn('Webhook received without tx_ref:', JSON.stringify(event));
      return res.status(200).send('Webhook received');
    }

    try {
      const paymentRef = this.db.doc(String(tx_ref));

      if (event.event === 'charge.completed' && status === 'successful') {
        // Record the successful payment (create-or-merge in case the record is missing)
        await paymentRef.set({
          status: 'SUCCESS',
          transactionId: id,
          amount,
          currency,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });

        // Grant the subscription only on confirmed success
        const existing = (await paymentRef.get()).data();
        const employerId = (eventData.meta && eventData.meta.employerId) || (existing && existing.meta && existing.meta.employerId);
        if (employerId) {
          try {
            await SubscriptionService.updateUserSubscriptionStatus(employerId, true);
          } catch (grantErr) {
            // Don't fail the webhook — Flutterwave retries on non-2xx.
            console.error(`Could not activate subscription for ${employerId}:`, grantErr.message);
          }
        }

        console.log(`✅ Payment successful for ${tx_ref}`);
      } else if (status === 'failed' || event.event === 'charge.failed') {
        await paymentRef.set({
          status: 'FAILED',
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });

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
