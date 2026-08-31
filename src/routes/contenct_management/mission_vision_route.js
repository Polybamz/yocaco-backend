import MissionVisionController from "../../controller/content_management/mission_ision/mission_ission_controller.js";
import { protect } from '../../middleware/auth.js';
import express from 'express';
const router = express.Router();

/// public read
/// get all mvc
router.get('/get-mvc', MissionVisionController.getMissionVisionCoreValues);

/// authenticated mutations
/// create mission vision
router.post('/create-mvc', protect, MissionVisionController.createAll);
/// update mission
router.put('/update-mision', protect, MissionVisionController.updateMission);
/// update vission
router.put('/update-vision', protect, MissionVisionController.updateVision);
/// update core values
router.put('/update-core-values', protect, MissionVisionController.updateCoreValues)
/// delete
// router.delete('/delete-mcv', MissionVisionController.de)

export default router;
