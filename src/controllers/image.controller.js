import { uploadImage } from "../config/cloudinary.js";
import { Image } from "../models/image.model.js";

export async function createImage(req, res) {
  try {
    const { name, description } = req.body || {};
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "Image file is required" });
    }

    if (!name) {
      return res.status(400).json({ error: "Name is required" });
    }

    const { url, publicId } = await uploadImage(file);

    const image = await Image.create({
      name,
      description: description || "",
      imageUrl: url,
      publicId,
    });

    return res.status(201).json(image);
  } catch (error) {
    console.error("Failed to create image:", error.message);
    return res.status(500).json({ error: "Failed to create image" });
  }
}

export async function getImages(req, res) {
  try {
    const limit = Math.min(Number(req.query.limit) || 0, 100) || 0;
    const page = Math.max(Number(req.query.page) || 1, 1);

    const query = Image.find().sort({ createdAt: -1 }).lean();

    if (limit > 0) query.skip((page - 1) * limit).limit(limit);

    const images = await query;
    const total = await Image.countDocuments();

    return res.json({ total, page, images });
  } catch (error) {
    console.error("Failed to fetch images:", error.message);
    return res.status(500).json({ error: "Failed to fetch images" });
  }
}
