import prisma from "../utils/prisma.js";
export const createProjectService = async (projectData) => {
    try {
        const { name, description, startDate, endDate, members } = projectData;
        return await prisma.$transaction(async (tx) => {
            const project = await tx.project.create({
                data: {
                    name,
                    description,
                    startDate: new Date(startDate),
                    endDate: new Date(endDate),
                },
            });

            const memberData = members.map(m => ({
                projectId: project.id,
                userId: m.userId,
                roleInProject: m.role || "member"
            }))
            await tx.projectMember.createMany({
                data: memberData
            });

            return project;
        });
    } catch (error) {
        console.error("create project error:", error);
        throw error;
    }
};
export const getAllProjectsService = async () => {
    try {
        const projects = await prisma.project.findMany({
            orderBy: { id: "asc" },
            select: {
                id: true,
                name: true,
                description: true,
                startDate: true,
                endDate: true
            }
        });
        return projects;
    } catch (error) {
        console.error(" PRISMA ERROR:", error);
        return null;
    }
};

export const getProjectByIdService = async (id) => {
    try {
        const project = await prisma.project.findUnique({
            where: { id: Number(id) },
            select: {
                id: true,
                name: true,
                description: true,
                startDate: true,
                endDate: true,
                members: {
                    select: {
                        userId: true,
                        roleInProject: true,
                        user: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                email: true,
                                avatar: true
                            }
                        }
                    }
                }
            }
        });
        return project;
    } catch (error) {
        console.error(" PRISMA ERROR:", error);
        return null;
    }
};

export const getUserProjectsService = async (userId) => {
    try {
        return await prisma.project.findMany({
            where: {
                members: {
                    some: {
                        userId: Number(userId),
                    },
                },
            },
            select: {
                id: true,
                name: true,
            },
            orderBy: {
                name: "asc",
            },
        });
    } catch (error) {
        console.error(" PRISMA ERROR:", error);
        throw error;
    }
};
