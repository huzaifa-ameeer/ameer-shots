/**
 * Application entry point.
 *
 * Responsibilities:
 *  1. Build the Express app and register global middleware
 *  2. Mount the route modules under their URL prefixes
 *  3. Connect to MongoDB *before* listening, so the server never accepts
 *     traffic while the database is unreachable
 */
import express from "express";
import cookieParser from "cookie-parser";
import { connectDb } from "./config/db.js";
import imageRoutes from "./routes/image.route.js";
import authRoutes from "./routes/auth.route.js";

const app = express();
const PORT = Number(process.env.PORT) || 3000;

/**
 * Global middleware.
 *
 * express.json()  - parses `Content-Type: application/json` request bodies
 *                   into req.body. Note: it does NOT handle file uploads,
 *                   those go through multer in the image router.
 * cookieParser()  - populates req.cookies so requireAdmin can read the
 *                   admin_token cookie that login sets.
 */
app.use(express.json());
app.use(cookieParser());

/** GET / - basic service greeting. */
app.get("/", (req, res) => {
  res.send("Hello from Express!");
});

/** GET /api/health - lightweight liveness probe. */
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

/** Admin authentication routes (login / logout). */
app.use("/api/auth", authRoutes);

/** Gallery routes (list, read, create, update, delete). */
app.use("/api/images", imageRoutes);

/**
 * Fallback for any path that matched no route above.
 */
app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

/**
 * Bootstrap sequence.
 *
 * connectDb() is awaited first: if Mongo is unreachable we exit(1) instead of
 * starting a server that would fail every request with a buffering timeout.
 */
try {
  await connectDb();

  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
} catch (err) {
  console.error("Failed to start server:", err.message);
  process.exit(1);
}
