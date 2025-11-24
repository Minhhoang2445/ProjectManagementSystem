import express from 'express';
import { registerUser, loginUser, signoutUser, refreshToken } from '../controllers/authControllers.js';

const router = express.Router();

router.post('/signup', registerUser);
router.post('/signin', loginUser);
router.post('/signout', signoutUser);
router.post('/refresh', refreshToken);
export default router;