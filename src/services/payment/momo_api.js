import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
dotenv.config();

const {
  MOMO_BASE_URL,
  MOMO_SUBSCRIPTION_KEY,
  MOMO_USER_ID,
  MOMO_API_KEY,
} = process.env;

async function getAccessToken() {
  const auth = Buffer.from(`${MOMO_USER_ID}:${MOMO_API_KEY}`).toString("base64");

  const headers = {
    "Authorization": `Basic ${auth}`,
    "Ocp-Apim-Subscription-Key": MOMO_SUBSCRIPTION_KEY,
  };

  const res = await axios.post(`${MOMO_BASE_URL}/collection/token/`, {}, { headers });
  return res.data.access_token;
}

export async function requestSubscriptionPayment({ amount, phoneNumber, planName }) {
  const accessToken = await getAccessToken();
  const referenceId = uuidv4();

  const headers = {
    "Authorization": `Bearer ${accessToken}`,
    "X-Reference-Id": referenceId,
    "X-Target-Environment": "sandbox",
    "Ocp-Apim-Subscription-Key": MOMO_SUBSCRIPTION_KEY,
    "Content-Type": "application/json",
  };

  const body = {
    amount: amount.toString(),
    currency: "XAF",
    externalId: referenceId,
    payer: {
      partyIdType: "MSISDN",
      partyId: phoneNumber,
    },
    payerMessage: `Subscription for ${planName}`,
    payeeNote: "Subscription Payment",
  };

  await axios.post(`${MOMO_BASE_URL}/collection/v1_0/requesttopay`, body, { headers });

  return referenceId;
}

export async function checkPaymentStatus(referenceId) {
  const accessToken = await getAccessToken();

  const headers = {
    "Authorization": `Bearer ${accessToken}`,
    "X-Target-Environment": "sandbox",
    "Ocp-Apim-Subscription-Key": MOMO_SUBSCRIPTION_KEY,
  };

  const res = await axios.get(
    `${MOMO_BASE_URL}/collection/v1_0/requesttopay/${referenceId}`,
    { headers }
  );

  return res.data;
}
