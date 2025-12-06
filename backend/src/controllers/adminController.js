import { getAllUsersService, updateUserStatusService } from "../services/adminService.js";
export const getAllUsers = async (req, res) => {
    try {
        const users = await getAllUsersService();
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