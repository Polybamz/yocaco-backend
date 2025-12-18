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
// get user by id
router.get('/get-user-by-id/:id', async (req,res)=> {
    try{
        const {uuid} = req.params
     const user = await userAuthController.getUserById(uuid)
      return res.status(200).json({success:true,user})
    } catch (er){
        console.log(er)
        return res.status(400).json({success:false, error})
    }
})

// router.put('/updateUser/:id', userAuthController.updateUser);

export default router;
