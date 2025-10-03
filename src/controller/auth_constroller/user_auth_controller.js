import {db , admin} from '../../config/config.js';
import validateProfile from '../../model/profile_models/js-model.js';

// interface AuthUser {
//   uid: string;
//   email: string | null;
//   name: string | null;
//   userType: 'jobseeker' | 'employer';
//   profileComplete: boolean;
// }


class userAuthController  {
   static createUser = async (req, res) => {
    try {
        const { email, password, name, userType } = req.body;
        const user = await admin.auth().createUser({
            email: email,
            password: password,
            emailVerified: false,
        });
        const docRef = db.collection('users').doc(user.uid);
        const doc = {
            uuid: user.uid,
            email: email,
            name: name,
            userType: userType,
            profileComplete: false,
            isSubscribed: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        await docRef.set(doc);
        const token = await admin.auth().createCustomToken(user.uid);
       const data = await this.getUserById(user.uid);
        return res.status(201).json({ message: 'User created successfully', token: token, user: data });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error creating user', error: error.message });
    }
   }

static loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const userRecord = await admin.auth().getUserByEmail(email);
        const user = await admin.auth().verifyPassword(userRecord.uid, password);
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const data = await this.getUserById(userRecord.uid);
        const token = await admin.auth().createCustomToken(userRecord.uid);
        return res.status(200).json({ token: token, user: data });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error logging in', error: error.message });
    }
}

static getUserById = async (uid) => {
    try {
        const userDoc = await db.collection('users').doc(uid).get();
        if (!userDoc.exists) {
            return null;
        }
        const user = userDoc.data();
        return user;
    } catch (error) {
        console.log(error);
        return null;
    }
}
static logoutUser = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }
        await admin.auth().revokeRefreshTokens(token);
        return res.status(200).json({ message: 'User logged out successfully' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error logging out', error: error.message });
    }
}

   static verifyToken = async (req, res, next) => {
        try {
            const token = req.headers.authorization?.split(' ')[1];
            if (!token) {
                return res.status(401).json({ message: 'No token provided' });
            }
            const decodedToken = await admin.auth().verifyIdToken(token);
            req.user = decodedToken;
            next();
        } catch (error) {
            console.log(error);
            return res.status(401).json({ message: 'Invalid token' });
        }
    }

    static getAllUsers = async (req, res) => {
        try {
            const users = [];
            const userDocs = await db.collection('users').get();
            userDocs.forEach((doc) => {
                const user = doc.data();
                users.push(user);
            });
            const employers = users.filter(user => user.userType === 'employer');
            const jobseekers = users.filter(user => user.userType === 'jobseeker');
            return res.status(200).json({ success: true, users: users, employers: employers, jobseekers: jobseekers });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ success:false, message: 'Error fetching users', error: error.message });
        }
    }

    // DELETE ACOUNT
    static deleteAcount = async (req, res) => {
        try {
            const { uid } = req.params;
            await admin.auth().deleteUser(uid);
            await db.collection('users').doc(uid).delete();
            return res.status(200).json({ message: 'User deleted successfully' });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Error deleting user', error: error.message });
        }
    }

    // create or update jobseeker profile
    static createOrUpdateJobseekerProfile = async (req, res) => {
        try {
            const { id } = req.params;
            const { fullName, email, phone, location, education, university, graduationYear, experience, skills, certifications, linkedinUrl, portfolioUrl, summary, hasMinimumRequirements } = req.body;
            const jobseekerProfile = {
                userId: id,
                fullName: fullName,
                email: email,
                phone: phone,
                location: location,
                education: education,
                university: university,
                graduationYear: graduationYear,
                experience: experience,
                skills: skills,
                certifications: certifications,
                linkedinUrl: linkedinUrl,
                portfolioUrl: portfolioUrl,
                summary: summary,
                hasMinimumRequirements: hasMinimumRequirements,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            const validationResult = validateProfile(jobseekerProfile);
            if (validationResult.error) {
                return res.status(400).json({ success: false, message: 'Invalid jobseeker profile data', error: validationResult.error.details[0].message });
            }
            const jobseekerProfileDoc = db.collection('jobSeekerProfiles').doc(id);
            await jobseekerProfileDoc.set(jobseekerProfile, { merge: true });
            const data = await this.getJobseekerProfile(req, res);
            return res.status(200).json({ success: true, message: 'Jobseeker profile updated successfully', data: data });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ success: false, message: 'Error updating jobseeker profile', error: error.message });
        }
    }
    // get jobseeker profile by id from jobSeekerProfiles collection
    static getJobseekerProfile = async (req, res) => {
        try {
            const { id } = req.params;
            const jobseekerProfile = await db.collection('jobSeekerProfiles').doc(id).get();
            if (!jobseekerProfile.exists) {
                return res.status(404).json({ message: 'Jobseeker profile not found' });
            }
            const data = jobseekerProfile.data();
            return res.status(200).json({ success: true, data: data });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ success: false, message: 'Error fetching jobseeker profile', error: error.message });
        }
    }

    // eperirence distribution from jobSeekerProfiles collection by "5-7","8-10","11-15","15+"
    static getExperienceDistribution = async (req, res) => {
        try {
            const experienceDistribution = {
                "5-7": 0,
                "8-10": 0,
                "11-15": 0,
                "15+": 0
            };
            const jobseekerProfiles = await db.collection('jobSeekerProfiles').get();
            jobseekerProfiles.forEach((doc) => {
                const jobseekerProfile = doc.data();
                const yearsOfExperience = jobseekerProfile.experience;
                if (yearsOfExperience == '5-7') {
                    experienceDistribution["5-7"] += 1;
                } else if (yearsOfExperience == '8-10') {
                    experienceDistribution["8-10"] += 1;
                } else if (yearsOfExperience == '11-15') {
                    experienceDistribution["11-15"] += 1;
                } else if (yearsOfExperience == '15+') {
                    experienceDistribution["15+"] += 1;
                }
            });
            return res.status(200).json({ success: true, experienceDistribution: experienceDistribution });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ success: false, message: 'Error fetching experience distribution', error: error.message });
        }
    }

};

export default userAuthController;