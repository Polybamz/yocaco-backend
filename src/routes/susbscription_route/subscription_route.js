import express from 'express';
import subscription_ser from '../../services/subscription_ser/subscription_ser.js';
const router = express.Router();
import { Job, scheduleJob } from 'node-schedule';

const job = scheduleJob('* * * * *', async ()=> {
    console.log('updating subscription status')
    await subscription_ser.updateExpiredSubscrition()
})

export default router