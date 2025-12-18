import express from 'express';
import JobController from '../../controller/jobs_controller/job_controller.js';
import JobsService from '../../services/job_ser/job_ser.js';
import { scheduleJob } from 'node-schedule';
const router = express.Router();

router.post('/createJob',  JobController.createJob);
router.get('/getAllJobs', JobController.getAllJobs);
router.delete('/deleteJobById/:id', JobController.deleteJobById);
router.put('/updateJobStatus/:id',  JobController.updateJobStatus);
router.put('/updateJob/:id',  JobController.updateJob);
router.get('/get-job-by-employer-id/:id', JobController.getJobByEmployerId);
router.get('/get-job-by-status/:status', JobController.getJobsByStatus);
router.get('/get-employer-job-analytics/:id', JobController.getJobAnalytics);
// Schedule a job every 2 hours to update expired jobs status
const job = scheduleJob('*/2 * * * *', async () => {
    const result = await JobsService.updateExpiredJobsStatus();
});
export default router;