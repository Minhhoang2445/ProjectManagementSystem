import prisma from "../utils/prisma.js";

export const canCreateTask = async (req, res, next) => {
    try {
        const { roleInProject } = req.projectMember;
        const userId = req.user.id;
        const projectId = req.projectId;

        if (roleInProject === "project_leader") {
            return next();
        }

        if (roleInProject === "member") {
            const teamLeader = await prisma.teamMember.findFirst({
                where: {
                    userId,
                    roleInTeam: "team_leader",
                    team: {
                        projectId,
                    },
                },
            });

            if (!teamLeader) {
                return res
                    .status(403)
                    .json({ message: "You do not have permission to create tasks" });
            }

            return next();
        }

        return res
            .status(403)
            .json({ message: "You do not have permission to create tasks" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Authorization error" });
    }
};
export const canSeeTask = async (req, res, next) => {
    try {
        const { roleInProject } = req.projectMember;
        const userId = req.user.id;
        const projectId = req.projectId;
        const taskId = Number(req.params.taskId);

        if (!taskId) {
            return res.status(400).json({ message: "Invalid task id" });
        }

        if (roleInProject === "project_leader") {
            return next();
        }

        const task = await prisma.task.findFirst({
            where: {
                id: taskId,
                projectId,
            },
            select: {
                assigneeId: true,
                teamId: true,
            },
        });

        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        if (task.assigneeId === userId) {
            return next();
        }

        if (task.teamId) {
            const isTeamLeader = await prisma.teamMember.findFirst({
                where: {
                    userId,
                    teamId: task.teamId,
                    roleInTeam: "team_leader",
                },
            });

            if (isTeamLeader) {
                return next();
            }
        }

        return res
            .status(403)
            .json({ message: "You do not have permission to view this task" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Authorization error" });
    }
};

