import express from 'express';
import JobController from '../../controller/jobs_controller/job_controller.js';
import { protect } from '../../middleWare/auth_mw.js/auth_mw.js';
const router = express.Router();

router.post('/createJob',  JobController.createJob);
router.get('/getAllJobs', JobController.getAllJobs);
router.delete('/deleteJobById/:id', JobController.deleteJobById);
router.put('/updateJobStatus/:id',  JobController.updateJobStatus);
router.put('/updateJob/:id',  JobController.updateJob);
router.get('/get-job-by-employer-id/:id', JobController.getJobByEmployerId);

export default router;