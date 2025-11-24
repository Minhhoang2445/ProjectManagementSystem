import express from 'express';
import { protectedRoute } from '../middleware/authMiddleware.js';
import { getUserController } from '../controllers/userController.js';

const router = express.Router();

router.get('/me', protectedRoute, getUserController);

export default router;