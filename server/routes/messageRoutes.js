import express from "express";
import { messageController } from "../controllers/messageController.js";
import { protectedRoutes } from "../middleware/auth.js";
import { fileUploader } from "../helpers/fileUploader.js";
const router = express.Router();

router.get("/users", protectedRoutes, messageController.getUserForSidebar);

router.get("/:id", protectedRoutes, messageController.getMessages);

router.put("/mark/:id", protectedRoutes, messageController.markMessageAsSeen);
router.put("/delete/:id", protectedRoutes, messageController.deleteMessage);
router.put("/edit/:id", protectedRoutes, messageController.editMessage);
router.put("/react/:id", protectedRoutes, messageController.reactToMessage);

router.post(
  "/sent/:id",
  fileUploader.upload.single("file"),
  protectedRoutes,
  messageController.sendMessage
);

export const messageRoutes = router;
