import MissionVisionController from "../../controller/content_management/mission_ision/mission_ission_controller.js";
import express from 'express';
const router = express.Router();


/// create mission vision
router.post('/create-mvc', MissionVisionController.createAll);
/// get all mvc
router.get('/get-mvc', MissionVisionController.getMissionVisionCoreValues);
/// update mission
router.put('/update-mision', MissionVisionController.updateMission);
/// update vission
router.put('/update-vision', MissionVisionController.updateVision);
/// update core values
router.put('/update-core-values', MissionVisionController.updateCoreValues)
/// delete
// router.delete('/delete-mcv', MissionVisionController.de)

export default router;