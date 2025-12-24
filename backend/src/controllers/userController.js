import { getUserInfoService, updateUserAvatarService } from "../services/userService.js";
export const getUserController = async (req, res) => {
    try {
        const user = await getUserInfoService(req.user.id);
        return res.status(200).json({ message: "Lấy thông tin người dùng thành công", user });
    } catch (error) {
        console.log("Lỗi khi lấy thông tin người dùng", error);
        res.status(500).json({ message: "Lỗi hệ thống" });
    }
};
export const updateUserAvatarController = async (req, res) => {
    try {
        // file được multer xử lý
        if (!req.file) {
            return res.status(400).json({ message: "Không tìm thấy file" });
        }

        // tạo URL trả về FE
        const avatar = `/uploads/avatars/${req.file.filename}`;

        // update DB
        const updatedUser = await updateUserAvatarService(req.user.id, avatar);

        return res.status(200).json({
            message: "Cập nhật avatar thành công",
            avatar,
            user: updatedUser,
        });
    } catch (error) {
        console.log("Lỗi khi cập nhật avatar", error);
        return res.status(500).json({ message: "Lỗi hệ thống" });
    }
};

