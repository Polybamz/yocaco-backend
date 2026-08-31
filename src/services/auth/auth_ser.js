import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.FIREBASE_WEB_API_KEY;
const IDENTITY_TOOLKIT = 'https://identitytoolkit.googleapis.com/v1';

/**
 * Verify an email + password against Firebase Auth using the REST API.
 * The Firebase Admin SDK intentionally cannot check passwords, so we use the
 * public Identity Toolkit endpoint with the (public) web API key.
 *
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{idToken:string, refreshToken:string, localId:string, email:string}>}
 * @throws {Error} with `status` = 401 on bad credentials
 */
export async function verifyPassword(email, password) {
  if (!API_KEY) {
    throw Object.assign(new Error('FIREBASE_WEB_API_KEY is not configured'), { status: 500 });
  }

  let resp;
  try {
    resp = await axios.post(
      `${IDENTITY_TOOLKIT}/accounts:signInWithPassword?key=${API_KEY}`,
      { email, password, returnSecureToken: true },
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    const code = error?.response?.data?.error?.message || 'INVALID_CREDENTIALS';
    throw Object.assign(new Error('Invalid email or password'), { status: 401, code });
  }

  return resp.data;
}
