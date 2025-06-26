import express from "express";
import { userController } from "../controllers/userController.js";

const router = express.Router();

router.get("/", userController.getAllUser)
router.get("/:userId", userController.findByUser)
router.post("/register", userController.registerUser)
router.post("/login", userController.loginUser)

export const userRoutes = router;