import prisma from "../utils/prisma.js";

export const projectAccess = async (req, res, next) => {
    try {
        const projectId = Number(req.params.projectId);
        const userId = req.user.id;
        const role = req.user.role;

        if (!projectId) {
            return res.status(400).json({ message: "Invalid project id" });
        }
        const isMember = await prisma.projectMember.findFirst({
            where: {
                projectId,
                userId
            }
        });
        if (role === "admin"){
            req.projectId = projectId;
            req.projectMember = { roleInProject: "project_leader" };
            return next();
        }
        if (!isMember) {
            return res.status(403).json({ message: "You do not have permission to view this project." });
        }
        req.projectId = projectId;
        req.projectMember = isMember;
        next();
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Authorization error" });
    }
};
