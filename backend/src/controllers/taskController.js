import { createTaskService, getTasksByProjectIdService, getTaskByIdService  } from "../services/taskService.js";
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