import express from "express";
import { getAllUsers, updateUserStatus } from "../controllers/adminController.js";
import { createProject, getAllProjects, getProjectById } from "../controllers/projectController.js";

import { protectedRoute, adminOnly } from "../middleware/authMiddleware.js";
import { validateBody } from "../middleware/validateMiddleware.js";
import { projectSchema } from "../schema/project.schema.js";
const router = express.Router();

router.get("/users", protectedRoute, adminOnly, getAllUsers);
router.patch("/users/:id/status", protectedRoute, adminOnly, updateUserStatus);
router.post("/projects", protectedRoute, adminOnly, validateBody(projectSchema), createProject); 
router.get("/projects", protectedRoute, adminOnly, getAllProjects); 
router.get("/projects/:id", protectedRoute, adminOnly, getProjectById);
export default router;
