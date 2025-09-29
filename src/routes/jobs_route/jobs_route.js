import express from 'express';
import JobController from '../../controller/jobs_controller/job_controller.js';
import { protect } from '../../middleWare/auth_mw.js/auth_mw.js';
const router = express.Router();

router.post('/createJob', protect, JobController.createJob);
router.get('/getAllJobs', JobController.getAllJobs);
router.delete('/deleteJobById/:id',protect, JobController.deleteJobById);
router.put('/updateJobStatus/:id', protect, JobController.updateJobStatus);
router.put('/updateJob/:id', protect, JobController.updateJob);
router.get('/get-job-by-employer-id/:id',protect, JobController.getJobByEmployerId);

export default router;