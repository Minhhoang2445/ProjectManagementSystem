import prisma from "../utils/prisma.js";

const normalizeDateInput = (value) => {
    if (!value) return null;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export const createProjectService = async (projectData) => {
    try {
        const { name, description, startDate, endDate, members, status = "planned" } = projectData;
        return await prisma.$transaction(async (tx) => {
            const project = await tx.project.create({
                data: {
                    name,
                    description,
                    status,
                    startDate: normalizeDateInput(startDate),
                    endDate: normalizeDateInput(endDate),
                },
            });

            const memberData = members.map((m) => ({
                projectId: project.id,
                userId: m.userId,
                roleInProject: m.role || "member",
            }));

            await tx.projectMember.createMany({
                data: memberData,
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
                status: true,
                startDate: true,
                endDate: true,
                createdAt: true,
                tasks: {
                    select: {
                        id: true,
                        status: true,
                    },
                },
            },
        });

        return projects.map((project) => ({
            ...project,
            tasks: project.tasks ?? [],
        }));
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
                status: true,
                startDate: true,
                endDate: true,
                createdAt: true,
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
                                avatar: true,
                            },
                        },
                    },
                },
                tasks: {
                    select: {
                        id: true,
                        status: true,
                    },
                },
            },
        });
        return project ? { ...project, tasks: project.tasks ?? [] } : null;
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

export const updateProjectService = async ({ projectId, payload }) => {
    try {
        const id = Number(projectId);
        return await prisma.$transaction(async (tx) => {
            const { name, description, status, startDate, endDate, members } = payload;

            const updates = {};
            if (name !== undefined) updates.name = name;
            if (description !== undefined) updates.description = description;
            if (status !== undefined) updates.status = status;
            if (startDate !== undefined) updates.startDate = normalizeDateInput(startDate);
            if (endDate !== undefined) updates.endDate = normalizeDateInput(endDate);

            if (Object.keys(updates).length) {
                await tx.project.update({
                    where: { id },
                    data: updates,
                });
            }

            if (Array.isArray(members) && members.length) {
                const uniqueMembers = members.filter(
                    (member, index, array) => index === array.findIndex((item) => item.userId === member.userId)
                );

                const existingMembers = await tx.projectMember.findMany({
                    where: {
                        projectId: id,
                        userId: {
                            in: uniqueMembers.map((member) => member.userId),
                        },
                    },
                    select: { userId: true },
                });

                const existingIds = new Set(existingMembers.map((member) => member.userId));
                const membersToCreate = uniqueMembers
                    .filter((member) => !existingIds.has(member.userId))
                    .map((member) => ({
                        projectId: id,
                        userId: member.userId,
                        roleInProject: member.role || "member",
                    }));

                if (membersToCreate.length) {
                    await tx.projectMember.createMany({
                        data: membersToCreate,
                        skipDuplicates: true,
                    });
                }
            }

            return tx.project.findUnique({
                where: { id },
                select: {
                    id: true,
                    name: true,
                    description: true,
                    status: true,
                    startDate: true,
                    endDate: true,
                    createdAt: true,
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
                                    avatar: true,
                                },
                            },
                        },
                    },
                    tasks: {
                        select: {
                            id: true,
                            status: true,
                        },
                    },
                },
            });
        });
    } catch (error) {
        console.error("update project error:", error);
        throw error;
    }
};
