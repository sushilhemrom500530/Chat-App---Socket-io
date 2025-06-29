import express from "express";
import { authController } from "../controllers/authController.js";
import { protectedRoutes } from "../middleware/auth.js";

const router = express.Router();

router.get("/check", protectedRoutes, authController.checkUser)

export const authRoutes = router;