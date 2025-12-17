import api from "@/lib/axios";  
import { get } from "react-hook-form";
export const projectService = {
    getAll: async () => {
        const res = await api.get("/project");
        return res.data;
    },

    getProjectById: async (projectId: number) => {
        const res = await api.get(`/project/${projectId}`);
        return res.data;
    },
    create: async (
        name: string,
        description: string,
        startDate: string,
        endDate: string,
        members: { userId: number; role: string }[]
    ) => {
        const res = await api.post("/project", {
            name,
            description,
            startDate,
            endDate,
            members
        });
        return res.data;
    },
    getUserProjects: async () => {
        const res = await api.get(`/project/user/me/projects`);
        return res.data;
    }
};