import {db , admin} from '../../config/config.js';
import validateProfile from '../../model/profile_models/js-model.js';
import { verifyPassword } from '../../services/auth/auth_ser.js';
import { signToken } from '../../middleware/auth.js';

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
        console.log('Request body:', req.body);
        const { email, password, name, userType } = req.body;
        if (!email || !password || !name || !userType) {
            console.log('Validation failed: missing fields', { email, password, name, userType });
            return res.status(400).json({ message: 'Email, password, name and userType are required' });
        }
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
        try {
            await docRef.set(doc);
        } catch (firestoreError) {
            // Don't leave an auth user behind if the profile row fails to persist
            await admin.auth().deleteUser(user.uid).catch(() => {});
            throw firestoreError;
        }
        const token = signToken({ uid: user.uid, email, name, userType });
       const data = await this.getUserById(user.uid);
        return res.status(201).json({ message: 'User created successfully', token: token, user: data });
    } catch (error) {
        console.log('Register failed:', error.code, '-', error.message);
        const firebaseErrors = {
            'auth/email-already-exists': { status: 409, message: 'An account with this email already exists. Please sign in instead.' },
            'auth/invalid-email': { status: 400, message: 'That email address is not valid.' },
            'auth/weak-password': { status: 400, message: 'Password should be at least 6 characters.' },
            'auth/invalid-password': { status: 400, message: 'Password should be at least 6 characters.' },
            'auth/missing-password': { status: 400, message: 'Password is required.' },
            'auth/too-many-requests': { status: 429, message: 'Too many attempts. Please try again in a moment.' },
            'auth/operation-not-allowed': { status: 503, message: 'Email/password sign-up is not enabled for this Firebase project.' },
            'auth/internal-error': { status: 502, message: 'The authentication service is temporarily unavailable. Please try again.' },
        };
        const mapped =
            firebaseErrors[error.code] ||
            (typeof error.message === 'string' && /password/i.test(error.message)
                ? { status: 400, message: error.message }
                : { status: 500, message: 'Error creating user' });
        return res.status(mapped.status).json({ message: mapped.message, error: error.message });
    }
   }

static loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }
        // Verify the password against Firebase Auth (never trust the client)
        const authResult = await verifyPassword(email, password);
        const data = await this.getUserById(authResult.localId);
        if (!data) {
            return res.status(404).json({ message: 'User account not found' });
        }
        const token = signToken({
            uid: data.uuid || authResult.localId,
            email: data.email,
            name: data.name,
            userType: data.userType,
        });
        return res.status(200).json({ token: token, user: data });
    } catch (error) {
        const status = error.status || 500;
        return res.status(status).json({ message: error.message || 'Error logging in' });
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
    // Session tokens are stateless JWTs; logout is handled client-side by
    // discarding the token. Nothing to invalidate server-side in P0.
    return res.status(200).json({ message: 'User logged out successfully' });
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
               
            };
            const validationResult = validateProfile(jobseekerProfile);
            if (validationResult.error) {
                return res.status(400).json({ success: false, message: 'Invalid jobseeker profile data', error: validationResult.error.details[0].message });
            }
            const jobseekerProfileDoc = db.collection('jobSeekerProfiles').doc(id);
            await jobseekerProfileDoc.set({...jobseekerProfile, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, { merge: true });
            // update profile complete flag in users collection
            const userDoc = db.collection('users').doc(id);
            await userDoc.update({ profileComplete: true });
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