import { timingSafeEqual } from "node:crypto";
import {
  signToken,
  setAuthCookie,
  clearAuthCookie,
} from "../middleware/auth.middleware.js";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

function safeEqual(a, b) {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));

  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export async function adminLogin(req, res) {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    if (!safeEqual(email, ADMIN_EMAIL) || !safeEqual(password, ADMIN_PASSWORD)) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    setAuthCookie(res, signToken({ email: ADMIN_EMAIL }));

    return res.json({ message: "Logged in" });
  } catch (error) {
    console.error("Admin login failed:", error.message);
    return res.status(500).json({ error: "Login failed" });
  }
}

export function adminLogout(req, res) {
  clearAuthCookie(res);
  return res.json({ message: "Logged out" });
}
