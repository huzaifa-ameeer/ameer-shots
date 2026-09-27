/**
 * MongoDB connection module.
 *
 * All database connection logic lives here so no other file has to know
 * how (or whether) we are connected.
 */
import mongoose from "mongoose";

/**
 * Opens the shared mongoose connection.
 *
 * The URI comes from MONGO_URI in .env, so credentials stay out of source
 * control. Mongoose keeps a single global connection, so calling this more
 * than once is harmless.
 *
 * @returns {Promise<import("mongoose").Connection>} the active connection
 * @throws {Error} re-throws after logging, so the caller can decide to exit
 */
export async function connectDb() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
    return mongoose.connection;
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    throw error;
  }
}
