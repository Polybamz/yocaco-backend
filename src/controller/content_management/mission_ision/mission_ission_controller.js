import mission_ision from "../../../services/content_manamet_ser/mission_ision.js";

class MissionVisionController {
    static async createAll(req, res) {
        try {
            const { mission, vision, coreValues } = req.body;
            const result = await mission_ision.createAll({ mission, vision, coreValues });
            res.status(201).json({ message: "Mission, Vision, and Core Values created successfully", result });
        } catch (error) {
            res.status(500).json({ message: "Error creating data", error: error.message });
        }
    }
    static async updateMission(req, res) {
        try {   
            const { mission } = req.body;
            const result = await mission_ision.updateMission(mission);
            res.status(200).json({ message: "Mission updated successfully", result });
        } catch (error) {
            res.status(500).json({ message: "Error updating mission", error: error.message });
        }
    }
    static async updateVision(req, res) {
        try {
            const { vision } = req.body;
            const result = await mission_ision.updateVision(vision);
            res.status(200).json({ message: "Vision updated successfully", result });
        } catch (error) {
            res.status(500).json({ message: "Error updating vision", error: error.message });
        }
    }
    static async updateCoreValues(req, res) {
        try {
            const { coreValues } = req.body;
            const result = await mission_ision.updateCoreValues(coreValues);
            res.status(200).json({ message: "Core Values updated successfully", result });
        } catch (error) {
            res.status(500).json({ message: "Error updating core values", error: error.message });
        }
    }
    static async getMissionVisionCoreValues(req, res) {
        try {
            const result = await mission_ision.getMissionVisionCoreValues();
            res.status(200).json({ message: "Mission, Vision, and Core Values retrieved successfully", result });
        } catch (error) {
            res.status(500).json({ message: "Error retrieving data", error: error.message });
        }
    }
}

export default MissionVisionController