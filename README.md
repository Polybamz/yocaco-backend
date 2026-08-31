# Yocaco Backend

Node.js / Express + Firebase Admin (Firestore) API for the YoCaCo / TIIB platform.

## Setup

1. Install dependencies: `npm install`
2. Configure environment variables (see below). Create a `.env` file locally — it is **not** committed to git.
3. Run: `npm run dev`

## Required environment variables

| Variable | Description |
| --- | --- |
| `PORT` | Server port (default `5000`) |
| `FIREBASE_PROJECT_ID` | Firebase project id (e.g. `yocaco-fb6f3`) |
| `FIREBASE_PRIVATE_KEY_ID` | Service-account key id |
| `FIREBASE_PRIVATE_KEY` | Service-account **private key** (multi-line; wrap in quotes) |
| `FIREBASE_CLIENT_EMAIL` | Service-account client email |
| `FIREBASE_CLIENT_ID` | Service-account client id |
| `FIREBASE_AUTH_URI` | `https://accounts.google.com/o/oauth2/auth` |
| `FIREBASE_TOKEN_URI` | `https://oauth2.googleapis.com/token` |
| `FIREBASE_AUTH_PROVIDER_X509_CERT_URL` | Google cert URL |
| `FIREBASE_CLIENT_X509_CERT_URL` | Service-account cert URL |
| `FIREBASE_WEB_API_KEY` | Firebase **web** API key (used to verify passwords server-side) |
| `JWT_SECRET` | Strong random secret used to sign session tokens |
| `CORS_ORIGINS` | Comma-separated list of allowed frontend origins |
| `FLW_PUBLIC_KEY` / `FLW_SECRET_KEY` / `FLW_SECRET_HASH` | Flutterwave keys |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Cloudinary keys |
| `MTN_BASE_URL` / `MTN_API_USER` / `MTN_API_KEY` / `MTN_SUBSCRIPTION_KEY` | MTN MoMo sandbox |
| `ORANGE_CLIENT_ID` / `ORANGE_CLIENT_SECRET` / `ORANGE_MERCHANT_ID` | Orange Money sandbox |
| `MAILCHIMP_API_KEY` / `MAILCHIMP_LIST_ID` | Mailchimp credentials for the newsletter proxy (`/api/newsletter`) |

> ⚠️ **Security:** never commit `.env` or paste service-account keys into this repo.
> The service-account private key grants full access to the Firebase project —
> rotate it immediately if it has ever been committed.

## Deployment

Set all environment variables in the hosting provider's dashboard (Render, etc.).
`CORS_ORIGINS` should be the exact deployed frontend origins, e.g.
`https://career-quest.example.com,https://admin.example.com`.

## Auth model

- Login verifies the password against Firebase Auth (REST `signInWithPassword`).
- On success the backend issues a signed JWT (7-day expiry) used as the session token.
- Protected routes require `Authorization: Bearer <token>`.
- Admin routes additionally require an `admin` role in the `admin_users` collection.
