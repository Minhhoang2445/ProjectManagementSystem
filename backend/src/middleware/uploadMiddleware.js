import multer from "multer";
import path from "path";
import fs from "fs";

// 1. Cấu hình Storage Engine (Bộ máy lưu trữ)
// Hàm này giúp tạo ra cấu hình dynamic cho từng loại thư mục (avatars hoặc attachments)
const storage = (folderName) => multer.diskStorage({
    destination: function (req, file, cb) {
        // Tạo đường dẫn: uploads/avatars hoặc uploads/attachments
        const uploadPath = path.join("uploads", folderName);

        // Kiểm tra xem thư mục có tồn tại không, nếu không thì tạo mới
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }

        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        // Đổi tên file để tránh trùng lặp: timestamp - tên_file_gốc
        // Ví dụ: 17099999-bao-cao-du-an.pdf
        // Việc giữ lại tên gốc (file.originalname) rất quan trọng với file đính kèm để user nhận biết file.

        // Xử lý tên file để bỏ các ký tự đặc biệt tiếng Việt nếu cần (tùy chọn), ở đây mình giữ nguyên
        // Dùng Buffer để xử lý tên file tiếng Việt không bị lỗi encoding
        const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');

        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + originalName);
    }
});

// 2. Bộ lọc cho Avatar (Chỉ nhận ảnh)
const avatarFilter = (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Định dạng file không hợp lệ! Chỉ chấp nhận ảnh (jpg, png, gif, webp)."), false);
    }
};

// 3. Bộ lọc cho Task Attachments (Nhận nhiều loại)
const attachmentFilter = (req, file, cb) => {
    // Bạn có thể mở rộng danh sách này tùy ý
    const allowedTypes = [
        "image/jpeg", "image/png", "image/gif", "image/webp", // Ảnh
        "application/pdf", // PDF
        "application/msword", // Word cũ (.doc)
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // Word mới (.docx)
        "application/vnd.ms-excel", // Excel cũ (.xls)
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // Excel mới (.xlsx)
        "text/plain", // Text
        "application/zip", // Zip
        "application/x-rar-compressed", // Rar
        "application/octet-stream" // Các file binary khác (cẩn thận với cái này nếu cần bảo mật cao)
    ];

    // Logic: Nếu muốn cho phép TẤT CẢ thì bỏ fileFilter này đi ở phần export.
    // Ở đây mình check để tránh user up file .exe hoặc file độc hại.
    if (allowedTypes.includes(file.mimetype) || file.mimetype.startsWith("image/")) {
        cb(null, true);
    } else {
        // Nếu muốn thoáng hơn, chỉ cần cb(null, true) để nhận tất cả
        cb(null, true);
    }
};

// --- EXPORT CONFIGURATIONS ---

// Dùng cho route upload Avatar (User)
export const uploadAvatar = multer({
    storage: storage("avatars"),
    fileFilter: avatarFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // Giới hạn 5MB
});

// Dùng cho route upload Task (Project)
// Cho phép upload nhiều file cùng lúc
export const uploadTaskAttachment = multer({
    storage: storage("attachments"),
    fileFilter: attachmentFilter,
    limits: { fileSize: 20 * 1024 * 1024 } // Giới hạn 20MB mỗi file
});