import api from "@/lib/axios";
import type { Project, ProjectMember } from "@/types/Project";

export type UpdateProjectPayload = Partial<
    Pick<Project, "name" | "description" | "status" | "startDate" | "endDate">
> & {
    members?: Array<{ userId: number; role: ProjectMember["roleInProject"] }>;
};

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
        status: Project["status"],
        members: { userId: number; role: string }[]
    ) => {
        const res = await api.post("/project", {
            name,
            description,
            startDate,
            endDate,
            status,
            members,
        });
        return res.data;
    },
    update: async (projectId: number, payload: UpdateProjectPayload) => {
        const res = await api.patch(`/project/${projectId}`, payload);
        return res.data;
    },
    getUserProjects: async () => {
        const res = await api.get(`/project/user/me/projects`);
        return res.data;
    },
};