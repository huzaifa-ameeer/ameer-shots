/**
 * Admin authentication controller.
 *
 * The single admin account is defined by ADMIN_EMAIL / ADMIN_PASSWORD in
 * .env rather than in code, so credentials are never committed.
 */
import { timingSafeEqual } from "node:crypto";
import {
  signToken,
  setAuthCookie,
  clearAuthCookie,
  readAdminSession,
} from "../middleware/auth.middleware.js";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

/**
 * Constant-time string comparison.
 *
 * A plain `===` leaks timing information: it returns as soon as it hits the
 * first differing character, letting an attacker discover the secret one
 * character at a time. timingSafeEqual always compares every byte.
 */
function safeEqual(a, b) {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));

  // timingSafeEqual throws on length mismatch, so check that first.
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

/**
 * POST /api/auth/login
 *
 * Exchanges email + password for a session cookie.
 * The token is intentionally NOT included in the response body.
 *
 * @returns 200 session cookie set
 * @returns 400 email or password missing
 * @returns 401 credentials did not match
 */
export async function adminLogin(req, res) {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // One generic message for both wrong email and wrong password, so the
    // response never reveals which of the two was incorrect.
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

/**
 * POST /api/auth/logout
 *
 * A cookie cannot be revoked from the client, so the server has to expire it.
 * The JWT itself stays valid until it expires naturally.
 *
 * @returns 200 cookie cleared
 */
export function adminLogout(req, res) {
  clearAuthCookie(res);
  return res.json({ message: "Logged out" });
}

/**
 * GET /api/auth/me
 *
 * Reports whether the request carries a valid admin session. The client calls
 * this to decide between showing the login form and the dashboard, because the
 * session cookie is httpOnly and therefore invisible to browser scripts.
 *
 * @returns 200 { email, role }
 * @returns 401 no cookie, or an invalid/expired token
 */
export function adminSession(req, res) {
  const session = readAdminSession(req);

  if (!session.ok) {
    return res.status(session.status).json({ error: session.error });
  }

  // Only the non-sensitive claims: the client has no use for the rest.
  return res.json({ email: session.admin.email, role: session.admin.role });
}
