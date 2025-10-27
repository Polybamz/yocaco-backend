import { db, admin } from "../../config/config.js";
import schedule from "node-schedule";

/**
 * Service class for interacting with the 'banners' Firestore collection.
 *
 * Expected banner data structure:
 * {
 * imageUrl: string,
 * linkUrl: string,
 * altText: string,
 * displayOrder: number,
 * isActive: boolean
 * startDare: Date,
 * numberOfDaye:number
 * }
 */
class BannerService {
  constructor() {
    this.collectionRef = db.collection("banners");
  }

  /**
   * Helper method to transform a Firestore QuerySnapshot into an array of objects.
   * @param {admin.firestore.QuerySnapshot} snapshot The Firestore query snapshot.
   * @returns {Array<object>} An array of banner data objects including their 'id'.
   */
  _mapSnapshotToData(snapshot) {
    if (snapshot.empty) {
      return [];
    }
    // Use the map function on the snapshot's documents array for clean transformation
    return snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    }));
  }

  /**
   * Creates a new banner document.
   * @param {object} data The banner data to save.
   * @returns {Promise<string>} The ID of the newly created document.
   */
 async createBanner(data) {
  try {
    // Expect data.startDate (as ISO string or Date) and data.numberOfDays (integer)
    const startDate = new Date(data.startDate);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + (data.numberOfDays || 0)); // Add the given number of days

    const docRef = await this.collectionRef.add({
      ...data,
      endDate: endDate.toISOString(), // Store in ISO format
    });

    return docRef.id;
  } catch (error) {
    console.error("Error creating banner:", error);
    throw new Error(error.message || "Failed to create banner.");
  }
}


  /**
   * Retrieves all active banners, typically for the client-facing front end.
   * @returns {Promise<Array<object>>} A promise that resolves to an array of active banner objects.
   */
  async getActiveBanners() {
    try {
      // Renamed for better convention: getActiveBanners
      const snapshot = await this.collectionRef
        .where("isActive", "==", true)
        // Optionally, add ordering here: .orderBy("displayOrder", "asc")
        .get();

      return this._mapSnapshotToData(snapshot);
    } catch (error) {
      console.error("Error fetching active banners:", error);
      throw new Error("Failed to retrieve active banners.");
    }
  }

  /**
   * Retrieves all banners (active and inactive), typically for an admin panel.
   * @returns {Promise<Array<object>>} A promise that resolves to an array of all banner objects.
   */
  async getAllBanners() {
    try {
      const snapshot = await this.collectionRef.get();

      return this._mapSnapshotToData(snapshot);
    } catch (error) {
      console.error("Error fetching all banners:", error);
      throw new Error("Failed to retrieve all banners.");
    }
  }

  /**
   * Retrieves a single banner by its ID.
   * @param {string} id The document ID of the banner.
   * @returns {Promise<object | null>} The banner object or null if not found.
   */
  async getBannerById(id) {
    try {
      const doc = await this.collectionRef.doc(id).get();
      if (doc.exists) {
        return {
          ...doc.data(),
          id: doc.id
        };
      } else {
        return null;
      }
    } catch (error) {
      console.error(`Error fetching banner with ID ${id}:`, error);
      throw new Error(`Failed to retrieve banner with ID: ${id}`);
    }
  }

  /**
   * Updates an existing banner document.
   * @param {string} id The document ID of the banner to update.
   * @param {object} data The fields to update.
   * @returns {Promise<void>} A promise that resolves when the update is complete.
   */
  async updateBanner(id, data) {
    try {
      // Using .update() only updates the specified fields
      await this.collectionRef.doc(id).update(data);
      // No need to return true/false; successful completion is implicitly 'true'
    } catch (error) {
      console.error(`Error updating banner with ID ${id}:`, error);
      throw new Error(`Failed to update banner with ID: ${id}`);
    }
  }

  /**
   * Deletes a banner document by its ID.
   * @param {string} id The document ID of the banner to delete.
   * @returns {Promise<void>} A promise that resolves when the deletion is complete.
   */
  async deleteBanner(id) {
    try {
      await this.collectionRef.doc(id).delete();
      // No need to return true/false; successful completion is implicitly 'true'
      return true;
    } catch (error) {
      console.error(`Error deleting banner with ID ${id}:`, error);
      throw new Error(`Failed to delete banner with ID: ${id}`);
    }
  }

  // update active status of banner based on current date and end date 
  async updateBannerActiveStatus() {
    try {
      const snapshot = await this.collectionRef.get();
      const currentDate = new Date();
      const batch = db.batch();

      snapshot.forEach(doc => {
        const data = doc.data();
        const endDate = new Date(data.endDate);
        const isActive = currentDate <= endDate;
        if (data.isActive!== isActive) {
          batch.update(doc.ref, { isActive });
        }
      });

      return batch.commit();
    } catch (error) {
      console.error("Error updating banner active status:", error);
      throw new Error("Failed to update banner active status.");
    }
  }

  // Schedule the active status update to run daily at midnight
 

}

export default new BannerService();