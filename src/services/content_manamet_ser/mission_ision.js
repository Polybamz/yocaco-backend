import { db } from "../../config/config.js";

class MissionVisionService {
  constructor() {
    this.collectionRef = db.collection("mission_vision");
    this.docRef = this.collectionRef.doc("main"); // single document to hold all data
  }

  // ---------- CREATE ----------
  async createAll({ mission, vision, coreValues = [] }) {
    console.log("Creating mission, vision, and core values:", { mission, vision, coreValues });
    return this.docRef.set({
      MISSION: mission,
      VISSION: vision,
      CORE_VALUE: coreValues,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  // ---------- UPDATE ----------
  async updateMission(mission) {
    return this.docRef.update({
      MISSION: mission,
      updatedAt: new Date(),
    });
  }

  async updateVision(vision) {
    return this.docRef.update({
      VISSION: vision,
      updatedAt: new Date(),
    });
  }

  async updateCoreValues(coreValues) {
    return this.docRef.update({
      CORE_VALUE: coreValues,
      updatedAt: new Date(),
    });
  }

  // ---------- FETCH ----------
  async getMissionVisionCoreValues() {
    try {
      const doc = await this.docRef.get();
      if (doc.exists) return doc.data();
      else return null;
    } catch (error) {
      console.error("Error fetching mission/vision/core values:", error);
      throw Error(error);
    }
  }
}

export default new MissionVisionService();
