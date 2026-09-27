/**
 * Admin authentication routes, mounted at /api/auth.
 */
import { Router } from "express";
import { adminLogin, adminLogout } from "../controllers/auth.controller.js";

const router = Router();

/** POST /api/auth/login - start an admin session. */
router.post("/login", adminLogin);

/** POST /api/auth/logout - end the admin session. */
router.post("/logout", adminLogout);

export default router;
