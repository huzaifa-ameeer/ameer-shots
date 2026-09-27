/**
 * Admin authentication routes, mounted at /api/auth.
 */
import { Router } from "express";
import {
  adminLogin,
  adminLogout,
  adminSession,
} from "../controllers/auth.controller.js";

const router = Router();

/** POST /api/auth/login - start an admin session. */
router.post("/login", adminLogin);

/** POST /api/auth/logout - end the admin session. */
router.post("/logout", adminLogout);

/** GET /api/auth/me - report the current session, 401 when signed out. */
router.get("/me", adminSession);

export default router;
