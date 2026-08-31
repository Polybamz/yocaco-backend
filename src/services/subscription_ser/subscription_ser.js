import subscribtionSchema from "../../model/subscribtion_model/subscribtion_model.js";
import { db, admin } from "../../config/config.js";
import userAuthController from '../../controller/auth_constroller/user_auth_controller.js';
import { sendMail } from "../../../utils.js";

class SubscriptionService {
    static async createSubscription(data) {
        console.log(data)
        try {
            const { value,error } = subscribtionSchema.validate(data);
            if (error) {
                throw new Error(error.details[0].message);
            }
            value.startDate = value.startDate.toISOString();
            value.endDate = value.endDate.toISOString();
            const subscriptionRef = db.collection("subscriptions").doc();
            await subscriptionRef.set(value);
           const user = await userAuthController.getUserById(value.employerId)
            
            //await this.updateUserSubscriptionStatus(data.employerId, true);
            return user;
        } catch (error) {
            console.log(error);
            throw new Error(error.details[0].message);
        }
    }
/// get subscription
    static async getSubscription(id) {
        try {
            const subscriptionRef = db.collection("subscriptions").doc(id);
            const subscriptionDoc = await subscriptionRef.get();
            if (!subscriptionDoc.exists) {
                throw new Error("Subscription not found");
            }
            return subscriptionDoc.data();
        } catch (error) {
            console.log(error);
            throw new Error(error.details[0].message);
        }
    }
    /// get subscription by employerId

  // ...existing code...
    static async getSubscriptionByEmployerId(employerId) {
        if (!employerId) {
            throw new Error('employerId is required');
        }
        try {
            const snapshot = await db
                .collection('subscriptions')
                .where('employerId', '==', employerId)
                .where('status', '==', 'active')
                .get();

            if (snapshot.empty) {
                return [];
            }

            const subscriptions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            return subscriptions;
        } catch (error) {
            console.error('Error fetching subscription by employerId:', error);
            throw new Error(error && error.message ? error.message : String(error));
        }
    }
// ...existing code...

    static async updateSubscription(id, data) {
        try {
            const { error } = subscribtionSchema.validate(data);
            if (error) {
                throw new Error(error.details[0].message);
            }
            const subscriptionRef = db.collection("subscriptions").doc(id);
            const subscriptionDoc = await subscriptionRef.get();
            if (!subscriptionDoc.exists) {
                throw new Error("Subscription not found");
            }
            await subscriptionRef.update(data);
            return subscriptionRef.id;
        } catch (er) {
            console.log(er)
            throw Error(er)
        }
    }

    static async deleteSubscription(id) {
        const subscriptionRef = db.collection("subscriptions").doc(id);
        const subscriptionDoc = await subscriptionRef.get();
        if (!subscriptionDoc.exists) {
            throw new Error("Subscription not found");
        }
        await subscriptionRef.delete();
        return id;
    }

    /// update subscription status in user collection
    static async updateUserSubscriptionStatus(userId, status) {
        try {
            const userRef = db.collection("users").doc(userId);
            const userDoc = await userRef.get();
            if (!userDoc.exists) {
                throw new Error("User not found");
            }
            await userRef.update({ isSubscribed: status });
            return userId;
        } catch (error) {
            console.log(error);
            throw new Error("Error updating user subscription status");
        }
    }
    // update status based on enddate
    static async updateExpiredSubscrition() {
        const currentDate = new Date()
        try {
            const subsSnapshot = await db.collection('subscriptions').where('status', '==', 'active').get();
            const batch = db.batch();
            const userUpdates = [];
            subsSnapshot.forEach((doc) => {
                const subs = doc.data();
                const subsDate = new Date(subs.endDate);
                const id = doc.id;
                if (subsDate < currentDate) {
                    const subsRef = db.collection('subscriptions').doc(id);
                    batch.update(subsRef, { status: 'expired', updatedAt: new Date().toISOString() });
                    userUpdates.push(
                        this.updateUserSubscriptionStatus(subs.employerId, false)
                            .catch(err => console.error('Error updating user subscription status:', err.message))
                    );
                }
            })
            // return number of updated jobs
            await batch.commit();
            await Promise.all(userUpdates);
           return subsSnapshot.size;
        } catch (er) {
            console.error("Error updating expired subs status:", er);
            ///  throw new Error(er);

        }
    }
    // get all subscriptions
    static async getAllSubscriptions() {
        try {
            const subsSnapshot = await db.collection('subscriptions').get();
            const subs = subsSnapshot.docs.map((doc) => {
                return { id: doc.id, ...doc.data() };
            });
            return subs;
        } catch (er) {
            console.error("Error getting all subscriptions:", er);
            throw new Error(er);
        }
    }

    // update status IN THE USER COLLECTION AND IN THE SUBSCRIPTION COLLECTION

    static async updateSubscriptionStatus(userId, status) {
        try {
            if (!userId || !status) {
                throw new Error("userId and status are required");
            }

            const isSubscribed = status === "active";

            console.log("Updating subscription:", { userId, status, isSubscribed });

            // Fetch subscriptions for this employer
            const snapshot = await db
                .collection("subscriptions")
                .where("employerId", "==", userId)
                .get();

            if (snapshot.empty) {
                throw new Error("No subscription found for this user");
            }
            // start date
            const startDate = new Date();
            // Prepare batch update
            const batch = db.batch();
            snapshot.forEach((doc) => {
                console.log("Updating subscription:", { id: doc.data(), status });
                const endDate = new Date(startDate.getTime() + doc.data().duration * 24 * 60 * 60 * 1000).toISOString();

                batch.update(doc.ref, {
                    status,
                    startDate : new Date().toISOString(),
                    endDate,
                    updatedAt: new Date().toISOString(),
                });
            });

            await batch.commit();

            // Update user subscription status
            await this.updateUserSubscriptionStatus(userId, isSubscribed);

            return {
                success: true,
                message: "Subscription updated successfully",
                userId,
                status,
            };

        } catch (error) {
            console.error("Error updating subscription:", error.message);
            throw new Error("Failed to update subscription status");
        }
    }

}

export default SubscriptionService;