/**
 * Mongoose model for a gallery image.
 *
 * We store only metadata plus the Cloudinary references - the binary itself
 * lives in Cloudinary, never in MongoDB.
 */
import mongoose from "mongoose";

const imageSchema = new mongoose.Schema(
  {
    /** User-facing title. */
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },

    /** Optional longer text. */
    description: {
      type: String,
      trim: true,
      default: "",
    },

    /** Public https URL of the uploaded asset. */
    imageUrl: {
      type: String,
      required: [true, "Image URL is required"],
    },

    /** Cloudinary identifier - required to delete the asset later. */
    publicId: {
      type: String,
      required: true,
    },
  },

  // Auto-manages createdAt / updatedAt fields.
  { timestamps: true }
);

export const Image = mongoose.model("Image", imageSchema);
