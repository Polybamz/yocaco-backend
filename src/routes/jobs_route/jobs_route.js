import express from 'express';
import JobController from '../../controller/jobs_controller/job_controller.js';
import JobsService from '../../services/job_ser/job_ser.js';
import { protect } from '../../middleware/auth.js';
import { scheduleJob } from 'node-schedule';
const router = express.Router();

// public reads
router.get('/getAllJobs', JobController.getAllJobs);
router.get('/get-job-by-employer-id/:id', protect, JobController.getJobByEmployerId);
router.get('/get-job-by-status/:status', JobController.getJobsByStatus);
router.get('/get-employer-job-analytics/:id', protect, JobController.getJobAnalytics);
router.get('/get-job-suggestions-for-seeker', protect, JobController.getJobSuggestionsForSeeker);

router.get('/get-job-seekers-for-employer', protect, JobController.getJobSeekersForEmployer);


// authenticated mutations
router.post('/createJob', protect, JobController.createJob);
router.delete('/deleteJobById/:jobId', protect, JobController.deleteJobById);
router.put('/updateJobStatus/:id', protect, JobController.updateJobStatus);
router.put('/updateJob/:id', protect, JobController.updateJob);

// Schedule a job every 2 hours to update expired jobs status.
// Guarded so it only schedules once even if this module is imported twice.
if (!global.__yocaco_job_expiry_scheduled) {
  global.__yocaco_job_expiry_scheduled = true;
  scheduleJob('0 */2 * * *', async () => {
    await JobsService.updateExpiredJobsStatus();
  });
}

export default router;
