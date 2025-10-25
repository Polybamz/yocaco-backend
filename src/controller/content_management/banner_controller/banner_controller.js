import banner from "../../../services/content_manamet_ser/banner.js";

class BannerController {
 static async createBanner(req, res) {
    try {
      const { bannerData } = req.body;
      const bannerDoc = await banner.createBanner(bannerData);
      return res.status(201).json({
        message: "Banner created successfully",
        banner: bannerDoc,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }

static  async getAllBanners(req, res) {
    try {
      const banners = await banner.getAllBanners();
      return res.status(200).json({
        message: "Banners fetched successfully",
        banners,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }

static  async getActiveBanners(req, res) {
    try {
      const banners = await banner.getActiveBanners();
      return res.status(200).json({
        message: "Active banners fetched successfully",
        banners,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }

 static async getBannerById(req, res) {
    try {
      const { id } = req.params;
      const bannerDoc = await banner.getBannerById(id);
      if (!bannerDoc) {
        return res.status(404).json({ message: "Banner not found" });
      }
      return res.status(200).json({
        message: "Banner fetched successfully",
        banner: bannerDoc,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }

 static async updateBanner(req, res) {
    try {
      const { id } = req.params;
      const { bannerData } = req.body;
      const bannerDoc = await banner.updateBanner(id, bannerData);
      if (!bannerDoc) {
        return res.status(404).json({ message: "Banner not found" });
      }
      return res.status(200).json({
        message: "Banner updated successfully",
        banner: bannerDoc,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }

 static async deleteBanner(req, res) {
    try {
      const { id } = req.params;
      const bannerDoc = await banner.deleteBanner(id);
      if (!bannerDoc) {
        return res.status(404).json({ message: "Banner not found" });
      }
      return res.status(200).json({
        message: "Banner deleted successfully",
        banner: bannerDoc,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
}

export default  BannerController;