import express from "express";
import { userController } from "../controllers/userController.js";

const router = express.Router();

router.post("/register", userController.registerUser)

export const userRoutes = router;