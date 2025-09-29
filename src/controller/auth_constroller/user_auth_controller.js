import {db , admin} from '../../config/config.js';

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
static createAdmin = async (req, res) => {}
static updateUser = async (req, res) => {

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
};

export default userAuthController;