import express from "express";
import {getAllUsers, suspendUser, updateUserStatus} from "../controllers/adminController.js";
import { protectedRoute, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/users", protectedRoute, adminOnly, getAllUsers);
router.patch("/users/:id", protectedRoute, adminOnly, suspendUser);
router.patch("/users/:id/status", protectedRoute, adminOnly, updateUserStatus);
export default router;
