import jwt from 'jsonwebtoken';
import { admin } from '../config/config.js';
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'dev-insecure-secret-change-me';
const TOKEN_EXPIRY = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Issue a signed session token for a user or admin.
 * @param {{uid:string, email:string, [name]:string, [fullName]:string, [userType]:string, [role]:string}} user
 * @returns {string} signed JWT
 */
export function signToken(user) {
  return jwt.sign(
    {
      uid: user.uid,
      email: user.email,
      name: user.name,
      fullName: user.fullName,
      userType: user.userType,
      role: user.role,
      isAdmin: user.isAdmin || undefined,
    },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );
}

/**
 * Require a valid Bearer token (app JWT, or a Firebase ID token as fallback).
 * Attaches the decoded user to `req.user`.
 */
export async function protect(req, res, next) {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  const token = header.split(' ')[1];

  try {
    // 1. App-issued JWT
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    return next();
  } catch (err) {
    // 2. Fall back to a Firebase ID token (e.g. client SDK sign-in)
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email || null,
        name: decodedToken.name || null,
      };
      return next();
    } catch (firebaseErr) {
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }
}

/**
 * Require an admin. Must run after `protect`.
 * Tokens minted by the admin login carry `isAdmin: true`; the literal role
 * `'admin'` is accepted too for accounts created before that flag existed.
 */
export function adminOnly(req, res, next) {
  if (!req.user || (req.user.isAdmin !== true && req.user.role !== 'admin')) {
    return res.status(403).json({ message: 'Not authorized, admin access required' });
  }
  next();
}
