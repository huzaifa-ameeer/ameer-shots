import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
const COOKIE_NAME = "admin_token";

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not set in .env");
}

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

export function clearAuthCookie(res) {
  res.clearCookie(COOKIE_NAME, { path: "/" });
}

export function signToken(admin) {
  return jwt.sign({ email: admin.email, role: "admin" }, JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

export function requireAdmin(req, res, next) {
  const token = req.cookies?.[COOKIE_NAME];

  if (!token) {
    return res.status(401).json({ error: "Admin authentication required" });
  }

  try {
    req.admin = jwt.verify(token, JWT_SECRET);

    if (req.admin.role !== "admin") {
      return res.status(403).json({ error: "Admin access only" });
    }

    return next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
