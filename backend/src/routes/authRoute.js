import express from 'express';
import { registerUser, loginUser, signoutUser } from '../controllers/authControllers.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/signout', signoutUser);
export default router;