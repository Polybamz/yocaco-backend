import cloudinary, { deleteImage } from "../../services/cloudinary/cloudinary.js";

class CloudinaryController {
  static async deleteImage(req, res) {
    try {
      const { public_id } = req.params;
      const result = await deleteImage(public_id);
      return res.status(200).json({ message: "Image deleted successfully" , result });
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  }
}

export default CloudinaryController;