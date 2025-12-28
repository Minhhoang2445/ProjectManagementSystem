import { getAllUsersService, updateUserStatusService, getSystemStatsService } from "../services/adminService.js";

export const getAllUsers = async (req, res) => {
    try {
        const {
            role,
            status,
            department,
            sort,
            order = "asc",
            page = 1,
            limit = 10
        } = req.query;

        const users = await getAllUsersService({
            role,
            status,
            department,
            sort,
            order,
            page: Number(page),
            limit: Number(limit)
        });

        return res.status(200).json(users);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};


export const updateUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const ok = await updateUserStatusService(id, status);

        if (!ok) return res.status(500).json({ message: "Failed to update user status" });

        return res.status(200).json({ message: "User status updated" });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const getSystemStats = async (req, res) => {
    try {
        const stats = await getSystemStatsService();
        return res.status(200).json(stats);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

