/**
 * Gallery routes, mounted at /api/images.
 *
 * Reading is public; writing requires an admin session (requireAdmin).
 */
import { Router } from "express";
import multer from "multer";
import {
  createImage,
  getImages,
  getImageById,
  updateImage,
  deleteImage,
} from "../controllers/image.controller.js";
import { requireAdmin } from "../middleware/auth.middleware.js";

const router = Router();

/**
 * Multer configuration.
 *
 * memoryStorage keeps the file as a Buffer in memory and hands it straight to
 * the Cloudinary stream, so nothing is written to disk.
 */
const upload = multer({
  storage: multer.memoryStorage(),

  // 5 MB ceiling; exceeding it triggers a LIMIT_FILE_SIZE error below.
  limits: { fileSize: 5 * 1024 * 1024 },

  // Reject anything that is not an image. The declared mimetype is only a
  // client-supplied hint - Cloudinary still validates the real bytes.
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"));
    }
    cb(null, true);
  },
});

/** GET /api/images - list images, newest first. Supports ?limit= &page=. */
router.get("/", getImages);

/** GET /api/images/:id - single image by Mongo id. */
router.get("/:id", getImageById);

/** PATCH /api/images/:id - update name and/or description. Admin only. */
router.patch("/:id", requireAdmin, updateImage);

/** DELETE /api/images/:id - remove from Cloudinary and MongoDB. Admin only. */
router.delete("/:id", requireAdmin, deleteImage);

/** POST /api/images - upload a new image. Admin only. */
router.post("/", requireAdmin, upload.single("image"), createImage);

/**
 * Error handler for this router (4-arg signature marks it as one).
 *
 * Without this, multer's errors reach Express's default handler and come back
 * as an HTML stack trace instead of JSON.
 */
router.use((err, req, res, next) => {
  if (err) {
    const status = err.code === "LIMIT_FILE_SIZE" ? 413 : 400;
    return res.status(status).json({ error: err.message });
  }
  next();
});

export default router;
