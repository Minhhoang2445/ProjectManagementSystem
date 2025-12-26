import express from "express";
import { createProject, getAllProjects, getProjectById, getUserProjectsController } from "../controllers/projectController.js";

import { protectedRoute, adminOnly } from "../middleware/authMiddleware.js";
import { validateBody } from "../middleware/validateMiddleware.js";
import { projectSchema } from "../schema/project.schema.js";
import { projectAccess } from "../middleware/projectAccessMiddleware.js";
import { createTaskSchema } from "../schema/task.schema.js";
import { canCreateAndDeleteTask, canSeeTask } from "../middleware/taskPermissionMiddleware.js";
import { createTaskController, getTasksByProjectIdController, getTaskByIdController, getUserTasksController, deleteTaskController } from "../controllers/taskController.js";
const router = express.Router();

router.post("/",protectedRoute,adminOnly,validateBody(projectSchema),createProject);

router.get("/",protectedRoute,adminOnly,getAllProjects);

router.get("/:projectId",protectedRoute,projectAccess,getProjectById);
router.get("/user/me/projects", protectedRoute, getUserProjectsController);


// route task related to project
router.post("/:projectId/tasks", protectedRoute, projectAccess, canCreateAndDeleteTask, validateBody(createTaskSchema), createTaskController);
router.get("/:projectId/tasks", protectedRoute, projectAccess, getTasksByProjectIdController);
router.get("/:projectId/tasks/:taskId", protectedRoute, projectAccess, canSeeTask, getTaskByIdController);
router.get("/user/me/tasks", protectedRoute, getUserTasksController);
router.delete("/:projectId/tasks/:taskId", protectedRoute, projectAccess, canCreateAndDeleteTask, deleteTaskController);
export default router;
