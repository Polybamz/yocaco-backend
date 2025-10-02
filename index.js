import express from 'express';
import cors from 'cors'
import dotenv from 'dotenv';
import authRoute from './src/routes/auth_route/auth_route.js';
import adminAuthRoute from './src/routes/admin_route/admin_auth_route.js';
import jobsRouter from './src/routes/jobs_route/jobs_route.js';
import userRouter from './src/routes/auth_route/auth_route.js';
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
    res.send('Welcome to yocaco APIs');
});
app.use('/api/auth', authRoute);
app.use('/api/admin', adminAuthRoute);
app.use('/api/jobs', jobsRouter);
app.use('/api/user', userRouter);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});