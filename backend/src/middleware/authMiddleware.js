import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import prisma from "../utils/prisma.js";
//authorization
export const protectedRoute = (req, res, next) => {
    try{
       // lấy token từ header
       const authHeader = req.headers["authorization"];
       const token = authHeader && authHeader.split(" ")[1];
       
       //xác nhận token hợp lệ
       if(!token){
           return res.status(401).json({message: "Không tìm thấy token"});
       }
       jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decodedUser) => {
            if(err){
                console.log("Lỗi khi kiểm tra token", err);
               return res.status(401).json({message: "Token không hợp lệ"});
            }
           //tìm user trong database
            const user = prisma.user.findUnique({
                where: {
                    id: decodedUser.id
                }
            });
            if(!user){
               return res.status(401).json({message: "Token không hợp lệ"});
            }
            req.user = user;
            next();
       });
    }
    catch{
        console.log("Lỗi khi kiểm tra token");
        return res.status(500).json({message: "Lỗi hệ thống"});
    }

}
