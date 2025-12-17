import api from "../lib/axios";

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

