import prisma from "../utils/prisma.js";
export const getUserInfoService = async (id) => {
    try{
        const user = await prisma.user.findUnique({
            where: { id: Number(id) },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true,
                department: true,  
                designation: true,
                status: true,
                avatar: true,
                
            }
        });
        return user;
    }
    catch(error){
        console.error("🔥 PRISMA ERROR:", error);
        return null;
    }
}



export const updateUserAvatarService = async (id, avatar) => {
    try{
        const updatedUser = await prisma.user.update({
            where: { id: Number(id) },
            data: { avatar }
        });
        return updatedUser;
    }
    catch(error){
        console.error("🔥 PRISMA ERROR:", error);
        return null;
    }
}