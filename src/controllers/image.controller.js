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
