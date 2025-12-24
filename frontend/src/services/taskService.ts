import api from "@/lib/axios"
import { get } from "react-hook-form";
import { create } from "zustand";
export const taskService = {
    getAll: async () => {
        const res = await api.get("/project/task");
        return res.data;
    },
    getTaskById: async (taskId: number) => {
        const res = await api.get(`/project/task/${taskId}`);
        return res.data;
    },
    getTasksByProjectId: async (projectId: number) => {
        const res = await api.get(`/project/${projectId}/tasks`);
        return res.data;
    },
    getUserTasks: async () => {
        const res = await api.get(`/users/me/tasks`);
        return res.data;
    },
    createTask: async (projectId: number, data: any) => {
        const res = await api.post(`/project/${projectId}/tasks`, data);
        return res.data;
    },
};