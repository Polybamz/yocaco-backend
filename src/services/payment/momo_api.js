import axios from "axios";
import dotenv from "dotenv";
dotenv.config();
const crypto = require('crypto');

/* -------------------------------------------------
   MTN MoMo helpers
   ------------------------------------------------- */
async function getMtnAccessToken() {
  const { MTN_API_USER, MTN_API_KEY, MTN_BASE_URL } = process.env;
  const auth = Buffer.from(`${MTN_API_USER}:${MTN_API_KEY}`).toString('base64');
  const resp = await axios.post(`${MTN_BASE_URL}/token`, 'grant_type=client_credentials', {
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Ocp-Apim-Subscription-Key': process.env.MTN_SUBSCRIPTION_KEY,
    },
  });
  return resp.data.access_token;
}

// Verify MTN callback signature (optional but recommended)
function verifyMtnSignature(body, receivedSig) {
  const secret = process.env.MTN_API_KEY; // same key used for token request
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(JSON.stringify(body));
  const computedSig = hmac.digest('hex');
  return computedSig === receivedSig;
}

/* -------------------------------------------------
   Orange Money helpers
   ------------------------------------------------- */
async function getOrangeAccessToken() {
  const { ORANGE_CLIENT_ID, ORANGE_CLIENT_SECRET, ORANGE_BASE_URL } = process.env;
  const auth = Buffer.from(`${ORANGE_CLIENT_ID}:${ORANGE_CLIENT_SECRET}`).toString('base64');
  const resp = await axios.post(`${ORANGE_BASE_URL}/oauth/token`, 'grant_type=client_credentials', {
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
  return resp.data.access_token;
}

// Orange webhook signature verification (see Orange docs for exact algorithm)
function verifyOrangeSignature(body, receivedSig) {
  const secret = process.env.ORANGE_CLIENT_SECRET;
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(JSON.stringify(body));
  const computedSig = hmac.digest('base64');
  return computedSig === receivedSig;
}

/* -------------------------------------------------
   Export
   ------------------------------------------------- */
export {
  getMtnAccessToken,
  verifyMtnSignature,
  getOrangeAccessToken,
  verifyOrangeSignature,
};