    import { createTaskSchema } from "../schema/task.schema.js";
import { createTaskService, getTasksByProjectIdService, getTaskByIdService, getUserTasksService, deleteTaskService, updateTaskService, uploadTaskAttachmentService  } from "../services/taskService.js";
export const createTaskController = async (req, res) => {
    try {
        
        // Parse Numeric Fields when using FormData
        const payload = { ...req.body };
        
        // Prioritize projectId from URL params if available, otherwise handle potential array from FormData
        if (req.params.projectId) {
            payload.projectId = Number(req.params.projectId);
        } else if (payload.projectId) {
            const pid = Array.isArray(payload.projectId) ? payload.projectId[0] : payload.projectId;
            payload.projectId = Number(pid);
        }

        // Handle assigneeId (ensure single value)
        if (payload.assigneeId) {
             const aid = Array.isArray(payload.assigneeId) ? payload.assigneeId[0] : payload.assigneeId;
             payload.assigneeId = Number(aid);
        }

        if (payload.teamId) {
            const tid = Array.isArray(payload.teamId) ? payload.teamId[0] : payload.teamId;
            payload.teamId = Number(tid);
        }

        const task = await createTaskService(payload);

        // Handle file uploads if any
        if (req.files && req.files.length > 0) {
            await uploadTaskAttachmentService({
                taskId: task.id,
                projectId: Number(req.params.projectId),
                user: req.user,
                files: req.files,
            });
        }

        // Re-fetch the full task with relations (assignee, attachments, etc.)
        const fullTask = await getTaskByIdService({
            taskId: task.id,
            projectId: payload.projectId,
        });

        return res.status(201).json({
            message: "Task created successfully",
            task: fullTask
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
export const getTasksByProjectIdController = async (req, res) => {
    try {
        const { priority, assigneeId } = req.query;

        const tasks = await getTasksByProjectIdService({
            projectId: req.projectId,
            userId: req.user.id,
            role: req.user.role,
            roleInProject: req.projectMember.roleInProject,
            priority,
            assigneeId: assigneeId ? Number(assigneeId) : undefined,
        });

        res.status(200).json(tasks);
    } catch (error) {
        console.error("CONTROLLER ERROR:", error);
        res.status(500).json({ message: "Failed to fetch tasks" });
    }
};

export const getTaskByIdController = async (req, res) => {
    try {
        const task = await getTaskByIdService({
            taskId: req.params.taskId,
            projectId: req.projectId,
        });
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }
        res.status(200).json(task
);
    } catch (error) {
        console.error("CONTROLLER ERROR:", error);
        res.status(500).json({ message: "Failed to fetch task" });
    }
};
export const getUserTasksController = async (req, res) => {
    try {
        const userId = req.user.id;
        const tasks = await getUserTasksService(userId);
        res.status(200).json(tasks);
    } catch (error) {
        console.error("CONTROLLER ERROR:", error);
        res.status(500).json({ message: "Failed to fetch user tasks" });
    }
};
export const deleteTaskController = async (req, res) => {
    try {
        const taskId = Number(req.params.taskId);
        const projectId = req.projectId;
        if (!taskId) {
            return res.status(400).json({ message: "Invalid task id" });
        }
        const deleted = await deleteTaskService({ taskId, projectId });
        if (!deleted) {
            return res.status(404).json({ message: "Task not found" });
        }
        return res.status(200).json({ message: "Task deleted successfully" });
    } catch (error) {
        console.error("CONTROLLER ERROR:", error);
        res.status(500).json({ message: "Failed to delete task" });
    }
};
export const updateTaskController = async (req, res) => {
    try {
        const taskId = Number(req.params.taskId);
        const projectId = req.projectId;
        const updateData = req.body;
        const user = req.user;

        if (!taskId) {
            return res.status(400).json({ message: "Invalid task id" });
        }

        const updatedTask = await updateTaskService({
            taskId,
            projectId,
            updateData,
            user,
        });

        if (!updatedTask) {
            return res.status(404).json({ message: "Task not found" });
        }

        res.status(200).json(updatedTask);
    } catch (error) {
        console.error("CONTROLLER ERROR:", error);
        res.status(500).json({ message: "Failed to update task" });
    }
};
export const uploadTaskAttachmentController = async (req, res) => {
    try {
        const taskId = Number(req.params.taskId);
        const projectId = Number(req.params.projectId);
        const user = req.user;
        const files = req.files;

        if (!taskId || !projectId) {
            return res.status(400).json({ message: "Invalid task or project id" });
        }

        if (!files || files.length === 0) {
            return res.status(400).json({ message: "No files uploaded" });
        }

        const attachments = await uploadTaskAttachmentService({
            taskId,
            projectId,
            user,
            files,
        });

        res.status(201).json({
            message: "Files uploaded successfully",
            attachments,
        });
    } catch (error) {
        console.error("UPLOAD ATTACHMENT ERROR:", error);
        res.status(500).json({ message: error.message || "Upload failed" });
    }
};