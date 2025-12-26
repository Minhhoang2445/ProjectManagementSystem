import prisma from "../utils/prisma.js";
export const createTaskService = async (taskData) => {
    try {
        const { title, description, status, priority, dueDate, projectId, assigneeId, teamId = null } = taskData;
        // check thành viên có còn active và thuộc project không
        const assignee = await prisma.projectMember.findFirst({
            where: {
                projectId,
                userId: Number(assigneeId),
                user: {
                    status: "active",
                },
            },
        });

        if (!assignee) {
            throw new Error("Assignee is not a valid member of this project");
        }
        // nếu có team thì check thành viên có thuộc team không
        if (teamId) {
            const inTeam = await prisma.teamMember.findFirst({
                where: {
                    teamId,
                    userId: Number(assigneeId),
                },
            });

            if (!inTeam) {
                throw new Error("Assignee does not belong to the specified team");
            }
        }
        const task = await prisma.task.create({
            data: {
                title,
                description,
                status,
                priority,
                dueDate,
                projectId,
                assigneeId,
                teamId,
            }
        });
        return task;
    } catch (error) {
        console.error("create task error:", error);
        throw error;
    }
};

export const getTasksByProjectIdService = async ({
    projectId,
    userId,
    roleInProject,
}) => {
    try {
        // Project leader -> thấy tất cả
        if (roleInProject === "project_leader") {
            return await prisma.task.findMany({
                where: { projectId: Number(projectId) },
                orderBy: { id: "asc" },
                select: {
                    id: true,
                    title: true,
                    description: true,
                    status: true,
                    priority: true,
                    dueDate: true,
                    assignee: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                        },
                    },
                    team: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            });
        }

        //  Member / Team leader
        return await prisma.task.findMany({
            where: {
                projectId: Number(projectId),
                OR: [
                    // task assign cho user
                    { assigneeId: userId },

                    // task thuộc team mà user là team leader
                    {
                        teamId: {
                            in: (
                                await prisma.teamMember.findMany({
                                    where: {
                                        userId,
                                        roleInTeam: "team_leader",
                                        team: { projectId: Number(projectId) },
                                    },
                                    select: { teamId: true },
                                })
                            ).map((t) => t.teamId),
                        },
                    },
                ],
            },
            orderBy: { id: "asc" },
            select: {
                id: true,
                title: true,
                description: true,
                status: true,
                priority: true,
                dueDate: true,
                assignee: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
                team: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });
    } catch (error) {
        console.error("PRISMA ERROR:", error);
        throw error;
    }

};
export const getTaskByIdService = async ({ taskId, projectId }) => {
    try {
        return await prisma.task.findFirst({
            where: {
                id: Number(taskId),
                projectId: Number(projectId),
            },
            select: {
                id: true,
                title: true,
                description: true,
                status: true,
                priority: true,
                dueDate: true,
                assignee: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        avatar: true,
                    },
                },
            },
        });
    } catch (error) {
        console.error("PRISMA ERROR:", error);
        throw error;
    }
};
export const getUserTasksService = async (userId) => {
    try {
        return await prisma.task.findMany({
            where: { assigneeId: Number(userId) },
            orderBy: { id: "asc" },
            select: {
                id: true,
                title: true,
                description: true,
                status: true,
                priority: true,
                startDate: true,
                dueDate: true,
                project: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });
    } catch (error) {
        console.error("PRISMA ERROR:", error);
        throw error;
    }
};
export const deleteTaskService = async ({ taskId, projectId }) => {
    try {
        const deletedTask = await prisma.task.deleteMany({
            where: {
                id: Number(taskId),
                projectId: Number(projectId),
            },
        });
        return deletedTask.count > 0;
    } catch (error) {
        console.error("PRISMA ERROR:", error);
        throw error;
    }
};