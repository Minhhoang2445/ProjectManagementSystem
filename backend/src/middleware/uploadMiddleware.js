import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/avatars");  // thư mục bạn muốn lưu
    },
    filename: function (req, file, cb) {
        const ext = file.originalname.split(".").pop();
        cb(null, Date.now() + "." + ext);
    }
});

export const uploadAvatar = multer({ storage });
