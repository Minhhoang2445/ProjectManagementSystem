import axios from "../lib/axios";

export const userService = {
  getAllUsers: async () => {
    const res = await axios.get("/admin/users");
    return res.data;
  },
   updateUserStatus: async (id: string, status: string) => {
    const res = await axios.patch(`/admin/users/${id}/status`, { status });
    return res.data;
  }
};