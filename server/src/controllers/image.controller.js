/**
 * Gallery controller.
 *
 * Handles the create / read / update / delete operations for images. Each
 * function receives the Express (req, res) pair and is wired up in
 * routes/image.route.js.
 */
import mongoose from "mongoose";
import {
  uploadImage,
  deleteImage as removeFromCloudinary,
} from "../config/cloudinary.js";
import { Image } from "../models/image.model.js";

/**
 * POST /api/images  (admin only)
 *
 * Uploads the posted file to Cloudinary, then stores the returned url and
 * publicId alongside the user's name and description in MongoDB.
 *
 * @returns 201 the created image document
 * @returns 400 no file attached, or name missing
 * @returns 500 upload or database failure
 */
export async function createImage(req, res) {
  try {
    // req.body is undefined for a request with no body at all.
    const { name, description } = req.body || {};

    // Populated by multer's upload.single("image").
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

/**
 * GET /api/images  (public)
 *
 * Returns images newest first. Results are paginated only when a positive
 * `limit` is supplied, so omitting it returns everything.
 *
 * @query limit  max results per page (capped at 100)
 * @query page   1-based page number
 * @returns 200 { total, page, images }
 */
export async function getImages(req, res) {
  try {
    const limit = Math.min(Number(req.query.limit) || 0, 100) || 0;
    const page = Math.max(Number(req.query.page) || 1, 1);

    // .lean() skips building full mongoose documents - measurably faster for
    // read-only endpoints.
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

/**
 * GET /api/images/:id  (public)
 *
 * @returns 200 the image document
 * @returns 400 id is not a valid ObjectId
 * @returns 404 no image with that id
 */
export async function getImageById(req, res) {
  try {
    const { id } = req.params;

    // Check the shape of the id before querying - a malformed id would
    // otherwise surface as an unhelpful CastError.
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid image id" });
    }

    const image = await Image.findById(id).lean();

    if (!image) {
      return res.status(404).json({ error: "Image not found" });
    }

    return res.json(image);
  } catch (error) {
    console.error("Failed to fetch image:", error.message);
    return res.status(500).json({ error: "Failed to fetch image" });
  }
}

/**
 * PATCH /api/images/:id  (admin only)
 *
 * Updates name and/or description. Only the fields present in the body are
 * changed, so the image file and publicId are never touched.
 *
 * @returns 200 the updated document
 * @returns 400 invalid id, blank name, or no updatable field provided
 * @returns 404 no image with that id
 */
export async function updateImage(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid image id" });
    }

    const { name, description } = req.body || {};
    const updates = {};

    // Check against undefined, not truthiness: "" is a legitimate way to
    // clear the description, but not a legitimate name.
    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({ error: "Name cannot be empty" });
      }
      updates.name = name.trim();
    }

    if (description !== undefined) {
      updates.description = description.trim();
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "Provide name or description" });
    }

    const image = await Image.findByIdAndUpdate(id, updates, {
      new: true, // return the post-update document, not the pre-update one
      runValidators: true, // enforce schema rules (e.g. required, maxlength)
    }).lean();

    if (!image) {
      return res.status(404).json({ error: "Image not found" });
    }

    return res.json(image);
  } catch (error) {
    console.error("Failed to update image:", error.message);
    return res.status(500).json({ error: "Failed to update image" });
  }
}

/**
 * DELETE /api/images/:id  (admin only)
 *
 * Removes the asset from Cloudinary and then the document from MongoDB.
 * Cloudinary is deleted first on purpose: if it throws, the database record
 * survives and the publicId is still on hand to retry the cleanup.
 *
 * @returns 200 { message, id }
 * @returns 400 invalid id
 * @returns 404 no image with that id
 * @returns 500 Cloudinary or database failure
 */
export async function deleteImage(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid image id" });
    }

    // Fetched as a full document (not .lean()) because deleteOne() is a
    // document method.
    const image = await Image.findById(id);

    if (!image) {
      return res.status(404).json({ error: "Image not found" });
    }

    await removeFromCloudinary(image.publicId);
    await image.deleteOne();

    return res.json({ message: "Image deleted", id: image._id });
  } catch (error) {
    console.error("Failed to delete image:", error.message);
    return res.status(500).json({ error: "Failed to delete image" });
  }
}
