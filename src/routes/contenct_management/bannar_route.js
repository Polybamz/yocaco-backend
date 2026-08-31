import express from 'express';
import BannerController from '../../controller/content_management/banner_controller/banner_controller.js';
import banner from '../../services/content_manamet_ser/banner.js';
import { protect } from '../../middleware/auth.js';
import schedule from 'node-schedule';
const router = express.Router();

/// public reads
router.get('/get-active-banner', BannerController.getActiveBanners);
router.get('/get-banners', BannerController.getAllBanners);
router.get('/get-banner-by-id/:id', BannerController.getBannerById);

/// authenticated mutations
router.post('/add-banner', protect, BannerController.createBanner);
router.put('/update-banner/:id', protect, BannerController.updateBanner);
router.delete('/delete-banner/:id', protect, BannerController.deleteBanner);

// run after midnight every day to deactivate expired banners.
// Guarded so it only schedules once even if this module is imported twice.
if (!global.__yocaco_banner_expiry_scheduled) {
  global.__yocaco_banner_expiry_scheduled = true;
  schedule.scheduleJob('0 0 * * *', async () => {
    console.log('Running scheduled job to deactivate expired banners');
    const result = await banner.updateBannerActiveStatus();
    console.log(`Scheduled job completed. Updated ${result.length} banners.`);
  });
}

export default router;
