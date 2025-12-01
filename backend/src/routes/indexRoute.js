import authRoute from './authRoute.js';
import express from 'express';
import userRoute from './userRoute.js';
import adminRoute from './adminRoute.js';

const router = express.Router();
router.use('/auth', authRoute);
router.use('/user', userRoute);
router.use('/admin', adminRoute);
export default router;