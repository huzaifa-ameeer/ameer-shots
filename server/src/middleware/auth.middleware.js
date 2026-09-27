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
const IS_PRODUCTION = process.env.NODE_ENV === "production";

/**
 * Cookie policy.
 *
 * Once both apps are deployed they live on *different sites* (Vercel for the
 * client, Render for the API), and a `SameSite=Strict` cookie is never sent on
 * those cross-site admin requests - the session would look like it had
 * vanished on every page load. "none" is what makes it travel, and browsers
 * only accept it together with `Secure`.
 *
 * In development both run on http://localhost, which counts as a single site,
 * so "lax" is enough there and avoids the HTTPS requirement. COOKIE_SAME_SITE
 * overrides the choice for any deployment that needs something else.
 */
const SAME_SITE =
  process.env.COOKIE_SAME_SITE || (IS_PRODUCTION ? "none" : "lax");

/** "none" is only honoured over HTTPS, so it forces Secure on. */
const SECURE = SAME_SITE === "none" ? true : IS_PRODUCTION;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not set in .env");
}

/**
 * Sets the admin session cookie.
 *
 * httpOnly  - not readable from JavaScript
 * sameSite  - see the policy above; "none" in production because the client and
 *             the API are served from different sites
 * secure    - HTTPS only, always on when sameSite is "none"
 * maxAge    - derived from the token's own `exp` so the cookie and the token
 *             can never expire at different times
 */
export function setAuthCookie(res, token) {
  const { exp } = jwt.decode(token);

  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: SAME_SITE,
    secure: SECURE,
    maxAge: exp * 1000 - Date.now(),
    path: "/",
  });
}

/** Removes the session cookie, using the same attributes it was set with. */
export function clearAuthCookie(res) {
  res.clearCookie(COOKIE_NAME, {
    path: "/",
    sameSite: SAME_SITE,
    secure: SECURE,
  });
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
