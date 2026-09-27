/**
 * Cloudinary configuration and upload helpers.
 *
 * Credentials are read from a single CLOUDINARY_URL in .env, in the format
 * cloudinary://<api_key>:<api_secret>@<cloud_name>
 */
import { v2 as cloudinary } from "cloudinary";

const CLOUDINARY_URL = process.env.CLOUDINARY_URL;

// Fail at boot rather than on the first upload attempt.
if (!CLOUDINARY_URL) {
  throw new Error("CLOUDINARY_URL is not set in .env");
}

cloudinary.config({
  cloudinary_url: CLOUDINARY_URL,
});

/**
 * Uploads an image and returns the identifiers we need to store and later
 * delete it.
 *
 * We stream the in-memory buffer instead of writing a temp file to disk.
 * `publicId` is the important one: the public URL can change (transformations,
 * CDN versions) but the publicId is stable and is what the destroy API needs.
 *
 * @param {{ buffer: Buffer }} file multer memory-storage file
 * @returns {Promise<{ url: string, publicId: string }>}
 */
export function uploadImage(file) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: process.env.CLOUDINARY_FOLDER || "image-gallery" },
      (error, result) => {
        if (error) return reject(error);
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );

    stream.end(file.buffer);
  });
}

/**
 * Removes an asset from Cloudinary by its publicId.
 *
 * @param {string} publicId value stored on the image document
 * @returns {Promise<object>} Cloudinary's destroy result
 */
export function deleteImage(publicId) {
  return cloudinary.uploader.destroy(publicId);
}

export default cloudinary;
