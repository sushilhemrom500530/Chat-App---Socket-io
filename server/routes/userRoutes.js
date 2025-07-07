import express from "express";
import { userController } from "../controllers/userController.js";
import { fileUploader } from "../helpers/fileUploader.js";
import { protectedRoutes } from "../middleware/auth.js";

const router = express.Router();

router.get("/", userController.getAllUser)
router.get("/:userId", userController.findByUser)
router.put(
    "/:userId",
    protectedRoutes, 
    fileUploader.upload.single("file"),
     userController.updateUser
    );
router.post("/register", userController.registerUser)
router.post("/login", userController.loginUser)

export const userRoutes = router;