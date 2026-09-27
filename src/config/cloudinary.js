import { v2 as cloudinary } from "cloudinary";

const CLOUDINARY_URL = process.env.CLOUDINARY_URL;

if (!CLOUDINARY_URL) {
  throw new Error("CLOUDINARY_URL is not set in .env");
}

cloudinary.config({
  cloudinary_url: CLOUDINARY_URL,
});

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

export function deleteImage(publicId) {
  return cloudinary.uploader.destroy(publicId);
}

export default cloudinary;
