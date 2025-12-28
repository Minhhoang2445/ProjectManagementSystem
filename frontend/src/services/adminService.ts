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

export const getSystemStats = async (): Promise<SystemStats> => {
  const response = await axiosInstance.get("/admin/stats");
  return response.data;
};
