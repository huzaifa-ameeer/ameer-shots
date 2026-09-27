import { Router } from "express";
import multer from "multer";
import {
  createImage,
  getImages,
  getImageById,
  updateImage,
  deleteImage,
} from "../controllers/image.controller.js";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"));
    }
    cb(null, true);
  },
});

router.get("/", getImages);
router.get("/:id", getImageById);
router.patch("/:id", updateImage);
router.delete("/:id", deleteImage);
router.post("/", upload.single("image"), createImage);

router.use((err, req, res, next) => {
  if (err) {
    const status = err.code === "LIMIT_FILE_SIZE" ? 413 : 400;
    return res.status(status).json({ error: err.message });
  }
  next();
});

export default router;
