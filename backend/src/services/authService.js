import bcrypt from "bcrypt";
import prisma from "../utils/prisma.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
const ACCESS_TOKEN_TTL = "10s";
export const REFRESH_TOKEN_TTL = 14 * 24 * 60 * 60 * 1000; //14 ngày
export const registerUserService = async (userData) => {
    const { firstName, lastName, email, password, designation, department } = userData;

    // kiểm tra username xem đã tồn tại chưa
    const existingUser = await prisma.user.findUnique({
        where: {
            email: email
        }
    });

    if (existingUser) {
        throw new Error("Email đã tồn tại");
    }

    // mã hóa password
    // salt = 10, số lần mà bcrypt sẽ mã hóa password
    const hashedPassword = await bcrypt.hash(password, 10);

    // tạo user
    const newUser = await prisma.user.create({
        data: {
            firstName,
            lastName,
            email,
            password: hashedPassword,
            designation,
            department,
            role: "staff",
            status: "pending"
        }
    });

    return newUser;
};

export const loginUserService = async (userData) => {
    const { email, password } = userData;

    // tìm user
    const user = await prisma.user.findUnique({
        where: {
            email: email
        }
    });

    if (!user) {
        throw new Error("Tài khoản hoặc mật khẩu không chính xác");
    }

    // so sánh password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        throw new Error("Tài khoản hoặc mật khẩu không chính xác");
    }
    //nếu hợp lệ, tạo token
    const accessToken = jwt.sign(
  {
    id: user.id,
    role: user.role,
    email: user.email,
    status: user.status, 

  },
  process.env.ACCESS_TOKEN_SECRET,
  { expiresIn: ACCESS_TOKEN_TTL } 
);


    // tạo refresh token
    const refreshToken = crypto.randomBytes(64).toString("hex");
    // tạo session mới để lưu refresh token
    await prisma.refreshToken.create({
        data: {
            token: refreshToken,     // phải là token
            userId: user.id,
            expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL)
        }
    });    

    return { user, accessToken, refreshToken };
};

export const signoutUserService = async (refreshToken) => {
    await prisma.refreshToken.deleteMany({
        where: {
            token: refreshToken
        }
    });
};
export const refreshTokenService = async (refreshToken) => {
    // tìm session
    const session = await prisma.refreshToken.findUnique({
        where: { token: refreshToken },
        include: { user: true }
    });

    if (!session) {
        throw new Error("Không tìm thấy session");
    }

    if (session.expiresAt < new Date()) {
        throw new Error("Refresh token đã hết hạn");
    }

    // tạo token mới
    const accessToken = jwt.sign(
        {
            id: session.user.id,
            role: session.user.role,
            email: session.user.email,
            status: session.user.status,
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: ACCESS_TOKEN_TTL }
    );

    return accessToken;
};

