import { createProjectService, getAllProjectsService, getProjectByIdService, getUserProjectsService, updateProjectService } from "../services/projectService.js";

export const createProject = async (req, res) => {
    try {
        const project = await createProjectService(req.body);
        return res.status(201).json({
            message: "Project created successfully",
            project
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
export const getAllProjects = async (req, res) => {
    try {
        const projects = await getAllProjectsService();
        return res.status(200).json(projects);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
export const getProjectById = async (req, res) => {
    try {
        const { projectId } = req.params;
        const project = await getProjectByIdService(projectId);
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }
        return res.status(200).json(project);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
export const updateProject = async (req, res) => {
    try {
        const { projectId } = req.params;
        const canManage = req.user.role === "admin" || req.projectMember?.roleInProject === "project_leader";

        if (!canManage) {
            return res.status(403).json({ message: "You are not allowed to update this project" });
        }

        const project = await updateProjectService({
            projectId: Number(projectId),
            payload: req.body,
        });

        return res.status(200).json({
            message: "Project updated successfully",
            project,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
export const getUserProjectsController = async (req, res) => {
    try {
        const userId = req.user.id;
        const projects = await getUserProjectsService(userId);
        return res.status(200).json(projects);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
export const updateTaskController = async (req, res) => {
    
};

export const deleteTaskController = async (req, res) => {
    // Implementation for deleting a task within a project
};
