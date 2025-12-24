import express from 'express';
import { protectedRoute } from '../middleware/authMiddleware.js';
import { getUserController, updateUserAvatarController } from '../controllers/userController.js';
import { uploadAvatar } from "../middleware/uploadMiddleware.js";
const router = express.Router();

router.get('/me', protectedRoute, getUserController);

router.post("/me/avatar",protectedRoute,uploadAvatar.single("avatar"),  updateUserAvatarController);
export default router;