import prisma from "../utils/prisma.js";
export const getAllUsersService = async ({
  role,
  status,
  department,
  sort,
  order,
  page,
  limit
}) => {
  try {
    // 1. Filter
    const where = {};
    if (role) where.role = role;
    if (status) where.status = status;
    if (department) where.department = department;

    // 2. Validate sort field
    const allowedSortFields = [
      "id",
      "firstName",
      "lastName",
      "email",
      "role",
      "status",
      "createdAt"
    ];

    let orderBy;

    if (sort && allowedSortFields.includes(sort)) {
      orderBy = { [sort]: order === "desc" ? "desc" : "asc" };
    } else {
      // default alphabet
      orderBy = [
        { firstName: "asc" },
        { lastName: "asc" }
      ];
    }

    // 3. Pagination
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy,
        skip,
        take: limit,
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
      }),
      prisma.user.count({ where })
    ]);

    return {
      page,
      limit,
      total,
      data: users
    };
  } catch (error) {
    console.error("🔥 PRISMA ERROR:", error);
    throw error;
  }
};



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

export const getSystemStatsService = async () => {
  try {
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);

    const [
      totalProjects,
      totalTasks,
      activeMembers,
      taskStatusDistribution,
      last7DaysTasks
    ] = await Promise.all([
      prisma.project.count(),
      prisma.task.count(),
      prisma.user.count({ where: { status: "active" } }),
      prisma.task.groupBy({
        by: ["status"],
        _count: {
          status: true,
        },
      }),
      prisma.task.findMany({
        where: {
          createdAt: { gte: sevenDaysAgo }
        },
        select: {
          createdAt: true,
          status: true,
        }
      })
    ]);

    return {
      totalProjects,
      totalTasks,
      activeMembers,
      taskStatusDistribution,
      last7DaysTasks
    };

  } catch (error) {
    console.error("getSystemStatsService error:", error);
    throw error;
  }
};
