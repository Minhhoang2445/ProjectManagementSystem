import { registerUserService, loginUserService, REFRESH_TOKEN_TTL } from "../services/authService.js";
import cookieParser from "cookie-parser";
export const registerUser = async(req, res) => {
    try{
        const {firstName, lastName, email, password, designation, department} = req.body;
        if(!firstName || !lastName || !email || !password || !designation || !department){
            return res.status(400).json({message: "không thể thiếu các thông tin"});
        }

        const newUser = await registerUserService(req.body);

        return res.status(201).json({message: "Tạo tài khoản thành công", user: newUser});

    }catch(error){
        console.log("Lỗi khi tạo tài khoản", error);
        if (error.message === "Email đã tồn tại") {
            return res.status(409).json({message: "Email đã tồn tại"});
        }
        res.status(500).json({message: "Lỗi khi tạo tài khoản"});
    }
};

export const loginUser = async (req, res) => {
    try{
        const {email, password} = req.body;
        if(!email || !password){
            return res.status(400).json({message: "không thể thiếu các thông tin"});
        }

        const { user, accessToken, refreshToken } = await loginUserService(req.body);
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: REFRESH_TOKEN_TTL
        });

        return res.json({
            message: "Đăng nhập thành công",
            accessToken,
            user
        });        
    }
    catch(error){
        console.log("Lỗi khi đăng nhập", error);
        if (error.message === "Tài khoản hoặc mật khẩu không chính xác") {
            return res.status(404).json({message: "Tài khoản hoặc mật khẩu không chính xác"});
        }
        res.status(500).json({message: "Lỗi khi đăng nhập"});
    }
};

export const signoutUser = async (req, res) => {
    try {
        const token = req.cookies?.refreshToken;
        if(!token){
            return res.status(400).json({message: "Không tìm thấy token"});
        }
        await signoutUserService(token);
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: true,
            sameSite: "none"
        });
        return res.status(204).json({message: "Đăng xuất thành công"});
    } catch (error) {
        console.log("Lỗi khi đăng xuất", error);
        res.status(500).json({message: "Lỗi khi đăng xuất"});
    }
}

