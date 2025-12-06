import prisma from "../utils/prisma.js";
export const getAllUsersService = async() => {
    try {
        const users = await prisma.user.findMany({
            orderBy: { id: "asc" },
        select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
            department: true,
            designation: true,
            status: true,
        }
    });
    return users;
    } catch (error) {
    console.error("🔥 PRISMA ERROR:", error);
        return null;
    }
}


export const updateUserStatusService = async (id, status) => {
  try {
    const validStatuses = ["active", "pending", "suspended"];
    if (!validStatuses.includes(status)) {
      throw new Error("Invalid status");
    }

    const user = await prisma.user.update({
      where: { id: Number(id) },
      data: { status },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        status: true,
        department: true,
        designation: true,
      }
    });

    return user;
  } catch (error) {
    console.error("update status error:", error);
    throw error;
  }
};



