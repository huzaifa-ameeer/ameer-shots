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
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDb } from "./config/db.js";
import imageRoutes from "./routes/image.route.js";
import authRoutes from "./routes/auth.route.js";

const app = express();
const PORT = Number(process.env.PORT) || 3000;

/**
 * Render (and Vercel, and any other reverse proxy) terminates TLS and forwards
 * the real protocol in `X-Forwarded-Proto`. Trusting one hop makes Express
 * agree with the outside world about `req.protocol` / `req.secure`.
 */
app.set("trust proxy", 1);

/**
 * CORS.
 *
 * The client is a separate Next.js app on a different site, so the browser
 * treats its requests as cross-origin.
 *
 * `credentials: true` is required for the admin session cookie to travel, and
 * that in turn means the origin cannot be the "*" wildcard - browsers reject
 * wildcard origins on credentialed requests. Each allowed origin is therefore
 * echoed back explicitly, taken from CLIENT_ORIGIN.
 */
const allowedOrigins = (process.env.CLIENT_ORIGIN || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

/**
 * Origin check.
 *
 * A plain entry has to match exactly. An entry written as `*.vercel.app`
 * matches any subdomain of that host, which is what makes Vercel's per-deploy
 * preview URLs usable without listing each one - the deployer still decides
 * which hosts are allowed, and a host such as `evil.vercel.app.attacker.com`
 * is rejected because the part in front of the suffix contains a dot.
 */
function isAllowedOrigin(origin) {
  return allowedOrigins.some((allowed) => {
    if (allowed === origin) return true;
    if (!allowed.startsWith("*.")) return false;

    const suffix = allowed.slice(1);
    if (!origin.endsWith(suffix)) return false;

    return !origin.slice(0, -suffix.length).includes(".");
  });
}

app.use(
  cors({
    origin(origin, callback) {
      // No Origin header: same-origin request or a tool like curl/Postman.
      if (!origin) return callback(null, true);
      if (isAllowedOrigin(origin)) return callback(null, true);

      const error = new Error(`Origin ${origin} is not allowed by CORS`);
      error.status = 403;
      return callback(error);
    },
    credentials: true,
  }),
);

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
 * Render injects PORT, so the service listens on whatever port it was given.
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
