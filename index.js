import express from 'express';
import cors from 'cors'
import dotenv from 'dotenv';
import authRoute from './src/routes/auth_route/auth_route.js';
import adminAuthRoute from './src/routes/admin_route/admin_auth_route.js';
import jobsRouter from './src/routes/jobs_route/jobs_route.js';
dotenv.config();
const app = express();
const PORT = process.env.PORT || 8081;

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

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});