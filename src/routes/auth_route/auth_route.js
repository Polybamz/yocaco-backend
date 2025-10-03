import userAuthController from '../../controller/auth_constroller/user_auth_controller.js';
import express from 'express';
const router = express.Router();


// user registration
router.post('/register', userAuthController.createUser);
// user login
router.post('/login', userAuthController.loginUser);
// get all users
router.get('/all-users', userAuthController.getAllUsers);
// profile
router.get('/jobseeker-profile/:id', userAuthController.getJobseekerProfile);
// delete account route
router.delete('/delete-user/:uid', userAuthController.deleteAcount);
// get experience distribution
router.get('/experience-distribution', userAuthController.getExperienceDistribution);
// create profile
router.post('/create-jobseeker-profile/:id',  userAuthController.createOrUpdateJobseekerProfile);

// router.put('/updateUser/:id', userAuthController.updateUser);

export default router;
