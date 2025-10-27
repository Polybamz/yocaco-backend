import express from 'express';
import BannerController from '../../controller/content_management/banner_controller/banner_controller.js';
import banner from '../../services/content_manamet_ser/banner.js';
import schedule from 'node-schedule';
const router = express.Router();


router.post('/add-banner', BannerController.createBanner );
router.get('/get-active-banner', BannerController.getActiveBanners);
router.get('/get-banners',BannerController.getAllBanners);
router.get('/get-banner-by-id/:id', BannerController.getBannerById);
router.put('/update-banner/:id', BannerController.updateBanner);
router.delete('/delete-banner/:id', BannerController.deleteBanner);
// run after midnight every day to deactivate expired banners
 const job = schedule.scheduleJob('0 0 * * *', async () => {
   console.log('Running scheduled job to deactivate expired banners');
  const result = await banner.updateBannerActiveStatus();
    console.log(`Scheduled job completed. Updated ${result.length} banners.`);
 });
export default router;

