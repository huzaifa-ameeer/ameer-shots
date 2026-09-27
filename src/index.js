import express from "express";
import { connectDb } from "./config/db.js";
import imageRoutes from "./routes/image.route.js";

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello from Express!");
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/images", imageRoutes);

try {
  await connectDb();
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
} catch (err) {
  console.error("Failed to start server:", err.message);
  process.exit(1);
}
