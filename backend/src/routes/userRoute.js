import express from 'express';
import { protectedRoute } from '../middleware/authMiddleware.js';
import { getUserController, testController } from '../controllers/userController.js';

const router = express.Router();

router.get('/me', protectedRoute, getUserController);
router.get('/test', protectedRoute, testController);
export default router;