import express from 'express';
import { registerUser, loginUser, signoutUser, refreshToken } from '../controllers/authControllers.js';
import { validateBody } from '../middleware/validateMiddleware.js';
import { registerSchema, loginSchema } from '../schema/auth.schema.js';
const router = express.Router();

router.post('/signup', validateBody(registerSchema), registerUser);
router.post('/signin', validateBody(loginSchema), loginUser);
router.post('/signout', signoutUser);
router.post('/refresh', refreshToken);
export default router;