import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';
import crypto from 'crypto';

// Mailchimp credentials live server-side only. The public site talks to our
// /api/newsletter endpoints, never to Mailchimp directly.
const API_KEY = process.env.MAILCHIMP_API_KEY;
const LIST_ID = process.env.MAILCHIMP_LIST_ID;
const DATACENTER = API_KEY ? API_KEY.split('-')[1] : null;

const BASE = DATACENTER ? `https://${DATACENTER}.api.mailchimp.com/3.0` : null;

const authHeaders = {
  Authorization: `apikey ${API_KEY}`,
  'Content-Type': 'application/json',
};

// Mailchimp identifies members by the MD5 hash of their lowercased email.
function subscriberHash(email) {
  return crypto.createHash('md5').update(email.trim().toLowerCase()).digest('hex');
}

export async function addSubscriber(email) {
  if (!BASE) throw new Error('Mailchimp is not configured (MAILCHIMP_API_KEY)');
  const { data } = await axios.post(
    `${BASE}/lists/${LIST_ID}/members`,
    { email_address: email, status: 'subscribed' },
    { headers: authHeaders }
  );
  return data;
}

export async function listSubscribers() {
  if (!BASE) throw new Error('Mailchimp is not configured (MAILCHIMP_API_KEY)');
  const { data } = await axios.get(`${BASE}/lists/${LIST_ID}/members`, {
    params: { count: 100 },
    headers: authHeaders,
  });
  return data.members || [];
}

export async function removeSubscriber(email) {
  if (!BASE) throw new Error('Mailchimp is not configured (MAILCHIMP_API_KEY)');
  const { data } = await axios.delete(
    `${BASE}/lists/${LIST_ID}/members/${subscriberHash(email)}`,
    { headers: authHeaders }
  );
  return data;
}

export default { addSubscriber, listSubscribers, removeSubscriber };
