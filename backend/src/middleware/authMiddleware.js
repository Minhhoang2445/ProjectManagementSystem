import jwt from "jsonwebtoken";
import prisma from "../utils/prisma.js";

export const protectedRoute = async (req, res, next) => {
  try {
    // lấy token từ header
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Không tìm thấy token" });
    }

    // verify token
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // tìm user trong db
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });

    if (!user) {
      return res.status(403).json({ message: "Token không hợp lệ" });
    }

    // gắn user vào request
    req.user = user;
    next();

  } catch (err) {
    console.error("JWT error:", err);
    return res.status(403).json({ message: "Token không hợp lệ hoặc đã hết hạn" });
  }
};
