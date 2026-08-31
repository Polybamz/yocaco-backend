import  {admin, db} from '../../config/config.js';
import { verifyPassword } from '../../services/auth/auth_ser.js';
import { signToken } from '../../middleware/auth.js';


class AdminAuthController {
   static async login(req, res) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({ message: 'Email and password are required' });
            }

            // Verify the password against Firebase Auth (never trust the client)
            const authResult = await verifyPassword(email, password);
            const uid = authResult.localId;

            const data = await AdminAuthController.getAdminUserById(uid);
            if (!data) {
                return res.status(404).json({ message: 'Admin user not found' });
            }

            const token = signToken({
                uid,
                email: data.email,
                fullName: data.fullName,
                role: data.role,
                isAdmin: true,
            });

            return res.status(200).json({ token: token, user: data });
        } catch (error) {
            const status = error.status || 500;
            return res.status(status).json({ message: error.message || 'Internal server error' });
        }
    }
    static async createAdminUser(req, res) {
    const { email, password, role, fullName,  } = req.body;
    try {
        const response = await admin.auth().createUser({
            email: email,
            password: password,

            emailVerified: true,   
            }); 
        const existingUser = await db.collection('admin_users').where('email', '==', email).get();
        if (!existingUser.empty) {
            return res.status(400).json({ message: 'User already exists' });
        }
        //const hashedPassword = await bcrypt.hash(password, 10);
        const user = {
            email,
            fullName,
            role
        };
        await db.collection('admin_users').doc(response.uid).set(user);
        return res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}
    static async getAllAdminUsers(req, res) {
        try {
            const usersSnapshot = await db.collection('admin_users').get();
            const users = usersSnapshot.docs.map(doc => ({ id: doc.id,...doc.data() }));
            return res.status(200).json(users);
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Internal server error' });
        }
        
}

// get user by id
static async getAdminUserById(adminId) {
    console.log('getAdminUserByIdddddddddddddddddddddddddddddd',adminId);
    try {
        const userDoc = await db.collection('admin_users').doc(adminId).get();
        if (!userDoc.exists) {
            return null;
        }
        return { id: userDoc.id,...userDoc.data() };
    } catch (error) {
        console.log(error);
        return null;
    }
}


}

export default AdminAuthController;