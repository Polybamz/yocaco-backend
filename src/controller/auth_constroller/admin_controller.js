import  {admin, db} from '../../config/config.js';

class AdminAuthController {
   static async login(req, res) {
        const { email, password } = req.body;

        const user = await db.collection(' admin_users ').findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        const token = await admin.auth().createCustomToken(user._id.toString());
        const data = await this.getAdminUserById(user._id.toString());
        return res.status(200).json({ token:token, user: data });
    }
    static async createAdminUser(req, res) {
    const { email, password, role } = req.body;
    try {
        const existingUser = await db.collection('admin_users').findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = {
            email,
            password: hashedPassword,
            role
        };
        await db.collection('admin_users').add(user);
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