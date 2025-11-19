import dotenv from "dotenv";
dotenv.config();

import axios from "axios";
import {
  getMtnAccessToken,
  verifyMtnSignature,
  getOrangeAccessToken,
  verifyOrangeSignature,
}  from "../../services/payment/momo_api.js";



/* -------------------------------------------------
   In‑memory store (replace with a DB in prod)
   ------------------------------------------------- */
const pending = new Map(); // key = externalId → {userId, planId}

/* -------------------------------------------------
   MTN MoMo – create subscription request
   ------------------------------------------------- */
const subsMomo = async (req, res) => {
  const { phone, amount, userId, planId, currency } = req.body; // amount in XAF (cents)

  if (!phone || !amount || !userId || !planId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const externalId = `momo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  pending.set(externalId, { userId, planId });

  try {
    const token = await getMtnAccessToken();
    const callbackUrl = `${process.env.CALLBACK_URL}/webhooks/momo`;
    const payload = {
      amount: amount.toString(),
      currency: currency,
      external_id: externalId,
      payer: { partyIdType: 'MSISDN', partyId: phone },
      payerMessage: `Subscribe to ${planId}`,
      payeeNote: 'Monthly premium',
      callback_url: callbackUrl,
    };

    const resp = await axios.post(
      `${process.env.MTN_BASE_URL}/collection/v1_0/requesttopay`,
      payload,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Ocp-Apim-Subscription-Key': process.env.MTN_SUBSCRIPTION_KEY,
        },
      }
    );

    // MTN returns 202 Accepted with a location header we can ignore for this demo
    res.json({ paymentUrl: resp.headers.location || resp.data.payment_url });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to create MoMo request' });
  }
};

/* -------------------------------------------------
const webhookMomo = async (req, res) => {
   ------------------------------------------------- */
const webhookMomo = async (req, res) => {
  const body = req.body;

  // 1️⃣ Verify signature (optional but recommended)
  const sig = req.headers['x-momo-signature'];
  if (!verifyMtnSignature(body, sig)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  const { externalId, status } = body;
  if (status === 'SUCCESS') {
    const meta = pending.get(externalId);
    if (meta) {
      // TODO: update your DB – mark userId as subscribed to planId
      console.log('✅ MoMo subscription active:', meta);
      pending.delete(externalId);
    }
  }

  // MTN expects a 200 OK with empty body
  res.status(200).send();
};

/* -------------------------------------------------
   Orange Money – create subscription mandate
   ------------------------------------------------- */
const subsOrange = async (req, res) => {
  const { phone, amount, userId, planId } = req.body;

  if (!phone || !amount || !userId || !planId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const externalId = `orange-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  pending.set(externalId, { userId, planId });

  try {
    const token = await getOrangeAccessToken();
    const callbackUrl = `${process.env.CALLBACK_URL}/webhooks/orange`;
    const payload = {
      merchant_id: process.env.ORANGE_MERCHANT_ID,
      subscriber: { phone_number: phone },
      amount: Number(amount),
      currency: 'XAF',
      description: `Subscribe to ${planId}`,
      frequency: 'MONTHLY',
      callback_url: callbackUrl,
      metadata: { externalId }, // ← custom metadata that Orange will echo back
    };

    const resp = await axios.post(`${process.env.ORANGE_BASE_URL}/subscriptions`, payload, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    // Orange returns a redirect URL you must open for the user to authorise
    res.json({ redirectUrl: resp.data.redirect_url });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to create Orange subscription' });
  }
};

/* -------------------------------------------------
   Orange Money – webhook endpoint
   ------------------------------------------------- */
const orangeWebhook = async (req, res) => {
  const body = req.body;

  // 1️⃣ Verify Orange signature
  const sig = req.headers['x-orange-signature'];
  if (!verifyOrangeSignature(body, sig)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  const { status, metadata } = body;
  const externalId = metadata?.externalId;

  if (status === 'ACTIVE' && externalId) {
    const meta = pending.get(externalId);
    if (meta) {
      // TODO: update your DB – mark userId as subscribed to planId
      console.log('✅ Orange subscription active:', meta);
      pending.delete(externalId);
    }
  }

  // Orange expects a 200 OK
  res.status(200).send();
};

export { subsMomo, webhookMomo, subsOrange, orangeWebhook };