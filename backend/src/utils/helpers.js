const cloudinary = require("../config/cloudinary");

/**
 * Upload a base64 or URL image to Cloudinary
 * @param {string} image - base64 data URI or URL
 * @param {string} folder - Cloudinary folder name
 */
const uploadToCloudinary = async (image, folder = "mediagram") => {
  if (!process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME === "your_cloud_name") {
    throw new Error("Cloudinary is not configured. Set CLOUDINARY_* in backend/.env");
  }
  const result = await cloudinary.uploader.upload(image, {
    folder,
    transformation: [{ quality: "auto", fetch_format: "auto" }],
  });
  return {
    url: result.secure_url,
    publicId: result.public_id,
  };
};

/**
 * Delete an image from Cloudinary by public_id
 */
const deleteFromCloudinary = async (publicId) => {
  if (!publicId) return;
  await cloudinary.uploader.destroy(publicId);
};

/**
 * Extract Cloudinary public_id from URL
 */
const extractPublicId = (url) => {
  if (!url) return null;
  const parts = url.split("/");
  const filename = parts[parts.length - 1];
  const folder = parts[parts.length - 2];
  return `${folder}/${filename.split(".")[0]}`;
};

/**
 * Format user object (remove password)
 */
const formatUser = (user) => {
  if (!user) return null;
  const { password, ...rest } = user;
  return rest;
};

/**
 * Paginate helper
 */
const getPaginationParams = (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(query.limit) || 10));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

module.exports = {
  uploadToCloudinary,
  deleteFromCloudinary,
  extractPublicId,
  formatUser,
  getPaginationParams,
};
