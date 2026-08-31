import express from 'express';
import cors from 'cors'
import dotenv from 'dotenv';
import authRoute from './src/routes/auth_route/auth_route.js';
import adminAuthRoute from './src/routes/admin_route/admin_auth_route.js';
import jobsRouter from './src/routes/jobs_route/jobs_route.js';
// userRouter is the same auth router, mounted under /api/user for the admin dashboard
import userRouter from './src/routes/auth_route/auth_route.js';
import articleRouter from './src/routes/article_route/article_route.js';
import paymentRoute from './src/controller/payment_controller/p_controller.js';
import testimonialsRouter from './src/routes/contenct_management/testimonials_route.js';
import bannerRouter from './src/routes/contenct_management/bannar_route.js';
import mvcRouter from './src/routes/contenct_management/mission_vision_route.js'
import cloudinaryRouter from './src/routes/cloudinary_route/cloudinary_route.js'
import subsRoute from './src/routes/susbscription_route/subscription_route.js'
import newsletterRoute from './src/routes/newsletter_route/newsletter_route.js'
import messagesRoute from './src/routes/messages_route/messages_route.js'
import contactRoute from './src/routes/contact_route/contact_route.js'
const app = express();
dotenv.config();
const PORT = process.env.PORT || 5000;

const corsOrigins = (process.env.CORS_ORIGINS || 'https://yocaco.yourcareercompanion.workers.dev')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

if (corsOrigins.length === 0) {
  console.warn('⚠️  CORS_ORIGINS is not set — falling back to permissive CORS. Set it to your frontend domains in production.');
}

app.use(cors({
  origin: '*',
}));
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Welcome to yocaco backend');
});
app.use('/api/auth', authRoute);
app.use('/api/admin', adminAuthRoute);
app.use('/api/jobs', jobsRouter);
app.use('/api/user', userRouter);
app.use('/api/article', articleRouter);
app.use('/api/payment', paymentRoute);
app.use('/api/testimonials', testimonialsRouter);
app.use('/api/banner', bannerRouter);
app.use('/api/mvc', mvcRouter);
app.use('/api/cloudinary', cloudinaryRouter);
app.use('/api/subscription', subsRoute)
app.use('/api/newsletter', newsletterRoute)
app.use('/api/messages', messagesRoute)
app.use('/api/contact', contactRoute)
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});app.get("/health", (req, res) => res.json({ status: "ok", service: "yocaco-backend", timestamp: new Date().toISOString() }));
