/**
 * Admin authentication middleware and JWT helpers.
 *
 * The session token is delivered as an httpOnly cookie rather than being
 * returned in the response body, so page scripts cannot read it and it is
 * not exposed to XSS.
 */
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
const COOKIE_NAME = "admin_token";

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not set in .env");
}

/**
 * Sets the admin session cookie.
 *
 * httpOnly  - not readable from JavaScript
 * sameSite  - "strict" blocks the cookie on cross-site requests (CSRF)
 * secure    - HTTPS only, enabled automatically in production
 * maxAge    - derived from the token's own `exp` so the cookie and the token
 *             can never expire at different times
 */
export function setAuthCookie(res, token) {
  const { exp } = jwt.decode(token);

  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    maxAge: exp * 1000 - Date.now(),
    path: "/",
  });
}

/** Removes the session cookie. */
export function clearAuthCookie(res) {
  res.clearCookie(COOKIE_NAME, { path: "/" });
}

/**
 * Creates a signed JWT for the given admin.
 *
 * @param {{ email: string }} admin
 * @returns {string} signed token
 */
export function signToken(admin) {
  return jwt.sign({ email: admin.email, role: "admin" }, JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

/**
 * Reads and verifies the admin session cookie.
 *
 * The single place that knows how a session is represented, so the route guard
 * below and the controller's "is anyone signed in" endpoint cannot drift apart.
 *
 * @param {import("express").Request} req
 * @returns {{ ok: true, admin: object } | { ok: false, status: number, error: string }}
 *   `status` is the HTTP code the caller should answer with: 401 when the
 *   cookie is missing, invalid or expired, 403 when it lacks the admin role.
 */
export function readAdminSession(req) {
  const token = req.cookies?.[COOKIE_NAME];

  if (!token) {
    return { ok: false, status: 401, error: "Admin authentication required" };
  }

  try {
    const admin = jwt.verify(token, JWT_SECRET);

    if (admin.role !== "admin") {
      return { ok: false, status: 403, error: "Admin access only" };
    }

    return { ok: true, admin };
  } catch {
    return { ok: false, status: 401, error: "Invalid or expired token" };
  }
}

/**
 * Route guard: allows the request through only for a valid admin session.
 *
 * Responds 401 when the cookie is missing, invalid or expired, and 403 when
 * the token is valid but lacks the admin role. On success it attaches the
 * decoded payload as req.admin.
 */
export function requireAdmin(req, res, next) {
  const session = readAdminSession(req);

  if (!session.ok) {
    return res.status(session.status).json({ error: session.error });
  }

  req.admin = session.admin;
  return next();
}
