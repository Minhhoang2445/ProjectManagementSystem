import prisma from "../utils/prisma.js";

export const createTaskService = async (taskData) => {
    try {
        const { title, description, status, priority, dueDate, projectId, assigneeId, teamId = null } = taskData;
        // check thành viên có còn active và thuộc project không
        const assignee = await prisma.projectMember.findFirst({
            where: {
                projectId: Number(projectId),
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
        console.error("task data:", taskData);
        throw error;
    }
};


export const getTasksByProjectIdService = async ({
    projectId,
    userId,
    role,
    roleInProject,
    priority,
    assigneeId,
}) => {
    try {
        const baseFilter = {
            projectId: Number(projectId),

            ...(priority && { priority }),
            ...(assigneeId && { assigneeId }),
        };

        if (role === "admin" || roleInProject === "project_leader") {
            return await prisma.task.findMany({
                where: baseFilter,
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
                    attachments: true,
                },
            });
        }

        const teamIds = await prisma.teamMember.findMany({
            where: {
                userId,
                roleInTeam: "team_leader",
                team: { projectId: Number(projectId) },
            },
            select: { teamId: true },
        });

        return await prisma.task.findMany({
            where: {
                ...baseFilter,
                OR: [
                    { assigneeId: userId },
                    {
                        teamId: {
                            in: teamIds.map((t) => t.teamId),
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
                attachments: true,
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

export const resolveTaskPermissionLevel = async ({ user, projectId }) => {
    if (user.role === "admin") return "ADMIN";

    const leader = await prisma.projectMember.findFirst({
        where: {
            projectId,
            userId: user.id,
            roleInProject: "project_leader",
        },
    });

    return leader ? "LEADER" : "MEMBER";
};

import { UPDATE_TASK_PERMISSION, UPLOAD_TASK_ATTACHMENT_PERMISSION  } from "../permissions/task.permission.js";
import { filterAllowedFields } from "../utils/task.FilterAllowedFields.js";

export const updateTaskService = async ({
    taskId,
    projectId,
    updateData,
    user,
}) => {
    // 1. Lấy task
    const task = await prisma.task.findFirst({
        where: {
            id: taskId,
            projectId,
        },
    });

    if (!task) return null;

    // 2. Resolve permission
    const permissionLevel = await resolveTaskPermissionLevel({
        user,
        projectId,
    });

    const allowedFields = UPDATE_TASK_PERMISSION[permissionLevel];
    if (!allowedFields) {
        throw new Error(`INVALID_PERMISSION_LEVEL: ${permissionLevel}`);
    }
    // 3. Lọc field được phép update
    const filteredUpdates = filterAllowedFields(updateData, allowedFields);

    if (Object.keys(filteredUpdates).length === 0) {
        throw new Error("FORBIDDEN_UPDATE_FIELDS");
    }

    // 4. Nếu update assignee → validate assignee
    if (filteredUpdates.assigneeId) {
        const assignee = await prisma.projectMember.findFirst({
            where: {
                projectId,
                userId: filteredUpdates.assigneeId,
                user: { status: "active" },
            },
        });

        if (!assignee) {
            throw new Error("ASSIGNEE_NOT_IN_PROJECT");
        }

        // nếu task có team → assignee phải thuộc team
        if (task.teamId) {
            const inTeam = await prisma.teamMember.findFirst({
                where: {
                    teamId: task.teamId,
                    userId: filteredUpdates.assigneeId,
                },
            });

            if (!inTeam) {
                throw new Error("ASSIGNEE_NOT_IN_TEAM");
            }
        }
    }

    // 5. Nếu update team → validate team
    if (filteredUpdates.teamId) {
        const team = await prisma.team.findFirst({
            where: {
                id: filteredUpdates.teamId,
                projectId,
            },
        });

        if (!team) {
            throw new Error("TEAM_NOT_IN_PROJECT");
        }

        // assignee hiện tại phải thuộc team mới
        const inTeam = await prisma.teamMember.findFirst({
            where: {
                teamId: filteredUpdates.teamId,
                userId: task.assigneeId,
            },
        });

        if (!inTeam) {
            throw new Error("ASSIGNEE_NOT_IN_TEAM");
        }
    }

    // 6. Update task
    return prisma.task.update({
        where: { id: task.id },
        data: filteredUpdates,
    });
};
export const uploadTaskAttachmentService = async ({
    taskId,
    projectId,
    user,
    files,
}) => {
    // 1. Check task tồn tại & thuộc project
    const task = await prisma.task.findFirst({
        where: {
            id: taskId,
            projectId,
        },
    });

    if (!task) {
        throw new Error("TASK_NOT_FOUND");
    }

    // 2. Resolve permission
    const permissionLevel = await resolveTaskPermissionLevel({
        user,
        projectId,
    });

    if (!UPLOAD_TASK_ATTACHMENT_PERMISSION[permissionLevel]) {
        throw new Error("FORBIDDEN_UPLOAD_ATTACHMENT");
    }

    // 3. Chuẩn hóa dữ liệu theo schema
    const attachmentData = files.map((file) => ({
        fileName: file.originalname,
        filePath: file.path,
        fileType: file.mimetype,
        fileSize: file.size,
        taskId: task.id,
        userId: user.id,
    }));

    // 4. Lưu DB
    await prisma.taskAttachment.createMany({
        data: attachmentData,
    });

    // 5. Trả về danh sách file vừa upload
    return prisma.taskAttachment.findMany({
        where: {
            taskId: task.id,
            filePath: {
                in: attachmentData.map((f) => f.filePath),
            },
        },
        orderBy: { createdAt: "desc" },
    });
};