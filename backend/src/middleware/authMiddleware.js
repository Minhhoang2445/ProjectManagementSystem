import jwt from "jsonwebtoken";
import prisma from "../utils/prisma.js";

export const protectedRoute = async (req, res, next) => {
  try {
    // lấy token từ header
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Vui lòng đăng nhập lại" });
    }

    // verify token
    let decoded;

    try {
      decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    } catch (err) {
      // Token expired OR invalid → KHÔNG cho biết chi tiết
      return res.status(401).json({ message: "Phiên đăng nhập đã hết hạn" });
    }
    // tìm user trong db
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });

    if (!user) {
      return res.status(401).json({ message: "Vui lòng đăng nhập lại" });
    }
    if (user.status === "suspended") {
      return res.status(403).json({ message: "Tài khoản của bạn đã bị tạm khóa" });
    }
    // gắn user vào request
    req.user = user;
    next();

  } catch (err) {
    console.error("JWT error:", err);
    return res.status(403).json({ message: "Token không hợp lệ hoặc đã hết hạn" });
  }
};

export const adminOnly = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Bạn không có quyền truy cập" });
  }
  next();
};

