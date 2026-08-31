import userAuthController from '../../controller/auth_constroller/user_auth_controller.js';
import { protect } from '../../middleware/auth.js';
import express from 'express';
const router = express.Router();


// public
// user registration
router.post('/register', userAuthController.createUser);
// user login
router.post('/login', userAuthController.loginUser);
// logout (client-side token discard)
router.post('/logout', userAuthController.logoutUser);

// authenticated
// get all users (admin dashboard)
router.get('/all-users', protect, userAuthController.getAllUsers);
// profile
router.get('/jobseeker-profile/:id', protect, userAuthController.getJobseekerProfile);
// delete account route
router.delete('/delete-user/:uid', protect, userAuthController.deleteAcount);
// get experience distribution
router.get('/experience-distribution', protect, userAuthController.getExperienceDistribution);
// create profile
router.post('/create-jobseeker-profile/:id', protect, userAuthController.createOrUpdateJobseekerProfile);
// get user by id
router.get('/get-user-by-id/:id', protect, async (req,res)=> {
    try{
        const { id } = req.params
        const user = await userAuthController.getUserById(id)
        return res.status(200).json({success:true,user})
    } catch (er){
        console.log(er)
        return res.status(400).json({success:false, error: er.message})
    }
})

// router.put('/updateUser/:id', userAuthController.updateUser);

export default router;
