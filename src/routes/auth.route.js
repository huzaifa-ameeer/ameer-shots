import { Router } from "express";
import { adminLogin, adminLogout } from "../controllers/auth.controller.js";

const router = Router();

//admin login
router.post("/login", adminLogin);
//admin logout
router.post("/logout", adminLogout);

export default router;
