import dotenv from 'dotenv';
dotenv.config();
const Flutterwave = require('flutterwave-node-v3');
const flw = new Flutterwave(
  process.env.FLW_PUBLIC_KEY,
  process.env.FLW_SECRET_KEY
);

class PaymentService {
  /**
   * Adds extra metadata to payment data for webhook identification.
   * @param {object} paymentData
   * @param {object} meta
   */
  _addMeta(paymentData, meta) {
    return {
      ...paymentData,
      meta: {
        ...paymentData.meta,
        ...meta,
      },
    };
  }

  /**
   * Initiates a card payment.
   * @param {object} paymentData - The payment details.
   * @param {object} meta - Extra data for webhook identification.
   */
  async initiateCardPayment(paymentData, meta = {}) {
    try {
      const data = this._addMeta(paymentData, meta);
      const response = await flw.Charge.card(data);
      return response;
    } catch (error) {
      console.error('Error initiating card payment:', error);
      throw new Error('Failed to initiate card payment.');
    }
  }

  /**
   * Initiates a bank transfer payment.
   * @param {object} paymentData
   * @param {object} meta
   */
  async initiateBankTransferPayment(paymentData, meta = {}) {
    try {
      const data = this._addMeta(paymentData, meta);
      const response = await flw.Charge.bank_transfer(data);
      return response;
    } catch (error) {
      console.error('Error initiating bank transfer payment:', error);
      throw new Error('Failed to initiate bank transfer payment.');
    }
  }

  /**
   * Initiates a USSD payment.
   * @param {object} paymentData
   * @param {object} meta
   */
  async initiateUSSDPayment(paymentData, meta = {}) {
    try {
      const data = this._addMeta(paymentData, meta);
      const response = await flw.Charge.ussd(data);
      return response;
    } catch (error) {
      console.error('Error initiating USSD payment:', error);
      throw new Error('Failed to initiate USSD payment.');
    }
  }

  /**
   * Initiates a mobile money payment.
   * @param {object} paymentData
   * @param {object} meta
   */
  async initiateMobileMoneyPayment(paymentData, meta = {}) {
    try {
      const data = this._addMeta(paymentData, meta);
      const response = await flw.Charge.mobilemoney(data);
      return response;
    } catch (error) {
      console.error('Error initiating mobile money payment:', error);
      throw new Error('Failed to initiate mobile money payment.');
    }
  }

  /**
   * Initiates an Orange Money payment.
   * @param {object} paymentData
   * @param {object} meta
   */
  async initiateOrangeMoneyPayment(paymentData, meta = {}) {
    try {
      const data = this._addMeta(paymentData, meta);
      const response = await flw.Charge.orangemoney(data);
      return response;
    } catch (error) {
      console.error('Error initiating Orange Money payment:', error);
      throw new Error('Failed to initiate Orange Money payment.');
    }
  }

  /**
   * Initiates an Airtel Money payment.
   * @param {object} paymentData
   * @param {object} meta
   */
  async initiateAirtelMoneyPayment(paymentData, meta = {}) {
    try {
      const data = this._addMeta(paymentData, meta);
      const response = await flw.Charge.airtellmoney(data);
      return response;
    } catch (error) {
      console.error('Error initiating Airtel Money payment:', error);
      throw new Error('Failed to initiate Airtel Money payment.');
    }
  }

  /**
   * Initiates a Ghana Mobile Money payment.
   * @param {object} paymentData
   * @param {object} meta
   */
  async initiateGhanaMobileMoneyPayment(paymentData, meta = {}) {
    try {
      const data = this._addMeta(paymentData, meta);
      const response = await flw.Charge.mobilemoneygh(data);
      return response;
    } catch (error) {
      console.error('Error initiating Ghana Mobile Money payment:', error);
      throw new Error('Failed to initiate Ghana Mobile Money payment.');
    }
  }

  /**
   * Initiates a Mpesa payment.
   * @param {object} paymentData
   * @param {object} meta
   */
  async initiateMpesaPayment(paymentData, meta = {}) {
    try {
      const data = this._addMeta(paymentData, meta);
      const response = await flw.Charge.mpesa(data);
      return response;
    } catch (error) {
      console.error('Error initiating Mpesa payment:', error);
      throw new Error('Failed to initiate Mpesa payment.');
    }
  }

  /**
   * Initiates a Francophone Mobile Money payment.
   * @param {object} paymentData
   * @param {object} meta
   */
  async initiateFrancophoneMobileMoneyPayment(paymentData, meta = {}) {
    try {
      const data = this._addMeta(paymentData, meta);
      const response = await flw.Charge.mobilemoneyfranco(data);
      return response;
    } catch (error) {
      console.error('Error initiating Francophone Mobile Money payment:', error);
      throw new Error('Failed to initiate Francophone Mobile Money payment.');
    }
  }

  /**
   * Verifies a transaction using its ID.
   * @param {string} transactionId - The transaction ID.
   */
  async verifyTransaction(transactionId) {
    try {
      const response = await flw.Transaction.verify({ id: transactionId });
      return response;
    } catch (error) {
      console.error('Error verifying transaction:', error);
      throw new Error('Failed to verify transaction.');
    }
  }

  /**
   * Handles Flutterwave webhook events.
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   */
  async handleWebhook(req, res) {
    // Optionally, verify signature here for security
    const event = req.body;
    // You can use event.data.meta to identify what the payment was for
    try {
      // Process event based on event.type or event.data.status
      // Example: if (event.event === 'charge.completed') { ... }
      res.status(200).send('Webhook received');
    } catch (error) {
      console.error('Error handling webhook:', error);
      res.status(500).send('Webhook error');
    }
  }
}

module.exports = PaymentService;