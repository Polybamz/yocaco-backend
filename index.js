import express from 'express';
import cors from 'cors'
import dotenv from 'dotenv';
import authRoute from './src/routes/auth_route/auth_route.js';
import adminAuthRoute from './src/routes/admin_route/admin_auth_route.js';
import jobsRouter from './src/routes/jobs_route/jobs_route.js';
import userRouter from './src/routes/auth_route/auth_route.js';
import articleRouter from './src/routes/article_route/article_route.js';
import paymentRoute from './src/controller/payment_controller/p_controller.js';
import testimonialsRouter from './src/routes/contenct_management/testimonials_route.js';
import bannerRouter from './src/routes/contenct_management/bannar_route.js';
import mvcRouter from './src/routes/contenct_management/mission_vision_route.js'
const app = express();
dotenv.config();
const PORT = process.env.PORT || 5000;
app.use(cors(
  {
    origin: '*'
  }
));
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
app.use('/api/mvc', mvcRouter)
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});