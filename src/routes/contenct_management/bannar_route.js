import express from 'express';
import BannerController from '../../controller/content_management/banner_controller/banner_controller.js';
const router = express.Router();


router.post('/add-banner', BannerController.createBanner );
router.get('/get-active-banner', BannerController.getActiveBanners);
router.get('/get-banners',BannerController.getAllBanners);
router.get('/get-banner-by-id/:id', BannerController.getBannerById);
router.put('/update-banner/:id', BannerController.updateBanner);
router.delete('/delete-banner/:id', BannerController.deleteBanner);

export default router;

