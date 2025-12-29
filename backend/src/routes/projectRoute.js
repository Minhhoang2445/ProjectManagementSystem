import express from "express";
import { createProject, getAllProjects, getProjectById, getUserProjectsController, updateProject } from "../controllers/projectController.js";

import { protectedRoute, adminOnly } from "../middleware/authMiddleware.js";
import { validateBody } from "../middleware/validateMiddleware.js";
import { projectSchema, projectUpdateSchema } from "../schema/project.schema.js";
import { projectAccess } from "../middleware/projectAccessMiddleware.js";
import { createTaskSchema } from "../schema/task.schema.js";
import { canCreateAndDeleteTask, canSeeTask } from "../middleware/taskPermissionMiddleware.js";
import { uploadTaskAttachment } from "../middleware/uploadMiddleware.js";
import { createTaskController, getTasksByProjectIdController, getTaskByIdController, getUserTasksController, deleteTaskController, updateTaskController, uploadTaskAttachmentController } from "../controllers/taskController.js";
const router = express.Router();

router.post("/", protectedRoute, adminOnly, validateBody(projectSchema), createProject);

router.get("/", protectedRoute, adminOnly, getAllProjects);

router.get("/user/me/projects", protectedRoute, getUserProjectsController);
router.get("/:projectId", protectedRoute, projectAccess, getProjectById);
router.patch("/:projectId", protectedRoute, projectAccess, validateBody(projectUpdateSchema), updateProject);


// route task related to project
router.post("/:projectId/tasks", protectedRoute, projectAccess, canCreateAndDeleteTask, uploadTaskAttachment.array("files", 10), createTaskController);
router.get("/:projectId/tasks", protectedRoute, projectAccess, getTasksByProjectIdController);
router.get("/:projectId/tasks/:taskId", protectedRoute, projectAccess, canSeeTask, getTaskByIdController);
router.get("/user/me/tasks", protectedRoute, getUserTasksController);
router.delete("/:projectId/tasks/:taskId", protectedRoute, projectAccess, canCreateAndDeleteTask, deleteTaskController);
router.patch("/:projectId/tasks/:taskId", protectedRoute, projectAccess, uploadTaskAttachment.array("files", 10), updateTaskController);
router.post("/:projectId/tasks/:taskId/attachments", protectedRoute, projectAccess, uploadTaskAttachment.array("files", 10), uploadTaskAttachmentController);
export default router;      