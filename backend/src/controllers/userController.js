export const getUserController = async (req, res) => {
    try {
        const user = req.user;
        return res.status(200).json({ message: "Lấy thông tin người dùng thành công", user });
    } catch (error) {
        console.log("Lỗi khi lấy thông tin người dùng", error);
        res.status(500).json({ message: "Lỗi hệ thống" });
    }
};