import axiosInstance from "../lib/axios";

export interface SystemStats {
  totalProjects: number;
  totalTasks: number;
  activeMembers: number;
  taskStatusDistribution: {
    status: string;
    _count: {
      status: number;
    };
  }[];
  last7DaysTasks: {
    createdAt: string;
    status: string;
  }[];
}
import api from "../lib/axios";
export const getSystemStats = async (): Promise<SystemStats> => {
  const response = await axiosInstance.get("/admin/stats");
  return response.data;
};
export const adminService = {
  getAllUsers: async () => {
    const res = await api.get("/admin/users");
    return res.data;
  },
  updateUserStatus: async (id: string, status: string) => {
    const res = await api.patch(`/admin/users/${id}/status`, { status });
    return res.data;
  },
  createProject: async (data: any) => {
    const res = await api.post("/admin/projects", data);
    return res.data;
  }
};