import cloudinary from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.v2.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error(error);
    return error;
  }
};

export default cloudinary;