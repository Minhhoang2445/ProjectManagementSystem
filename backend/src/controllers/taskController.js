import { createTaskSchema } from "../schema/task.schema.js";
import { createTaskService, getTasksByProjectIdService, getTaskByIdService, getUserTasksService, deleteTaskService  } from "../services/taskService.js";
export const createTaskController = async (req, res) => {
    try {
        const task = await createTaskService(req.body);
        return res.status(201).json({
            message: "Task created successfully",
            task
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
export const getTasksByProjectIdController = async (req, res) => {
    try {
        const tasks = await getTasksByProjectIdService({
            projectId: req.projectId,
            userId: req.user.id,
            roleInProject: req.projectMember.roleInProject,
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