import subscribtionSchema from "../../model/subscribtion_model/subscribtion_model.js";
import { db, admin } from "../../config/config.js";
import e from "cors";

class SubscriptionService {
    async createSubscription(data) {
        try {
            const { error } = subscribtionSchema.validate(data);
            if (error) {
                throw new Error(error.details[0].message);
            }
            const subscriptionRef = db.collection("subscriptions").doc();
            await subscriptionRef.set(data);
            await this.updateUserSubscriptionStatus(data.employerId, true);
            return subscriptionRef.id;
        } catch (error) {
            console.log(error);
            throw new Error(error.details[0].message);
        }
    }

    async getSubscription(id) {
        const subscriptionRef = db.collection("subscriptions").doc(id);
        const subscriptionDoc = await subscriptionRef.get();
        if (!subscriptionDoc.exists) {
            throw new Error("Subscription not found");
        }
        return subscriptionDoc.data();
    }

    async updateSubscription(id, data) {
     try {  const { error } = subscribtionSchema.validate(data);
        if (error) {
            throw new Error(error.details[0].message);
        }
        const subscriptionRef = db.collection("subscriptions").doc(id);
        const subscriptionDoc = await subscriptionRef.get();
        if (!subscriptionDoc.exists) {
            throw new Error("Subscription not found");
        }
        await subscriptionRef.update(data);
        return subscriptionRef.id;} catch (er) {
            consol.log(er)
            throw Error(er)
        }
    }

    async deleteSubscription(id) {
        const subscriptionRef = db.collection("subscriptions").doc(id);
        const subscriptionDoc = await subscriptionRef.get();
        if (!subscriptionDoc.exists) {
            throw new Error("Subscription not found");
        }
        await subscriptionRef.delete();
        return id;
    }

    /// update subscription status in user collection
    async updateUserSubscriptionStatus(userId, status) {
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
    async updateExpiredSubscrition() {
        const currentDate = Date()
        try {
            const subsSnapshot = await db.collection('subscriptions').where('status', '==', 'active').get();
            const batch = db.batch();
            subsSnapshot.forEach((doc) => {
                const subs = doc.data();
                const subsDate = new Date(subs.endDate);
                if (subsDate < currentDate) {
                    const subsRef = db.collection('subscriptions').doc(doc.id);
                    batch.update(subsRef, { status: 'expired', updatedAt: new Date().toISOString() });
                    this.updateUserSubscriptionStatus(doc.id, false)
                }
            })
            // return number of updated jobs
            await batch.commit();
            return subsSnapshot.size;
        } catch (er) {
               console.error("Error updating expired subs status:", er);
          ///  throw new Error(er);

        }
    }
}

export default new SubscriptionService();