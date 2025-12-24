import axios from "../lib/axios";

export const userService = {
    uploadAvatar: async (file: File) => {
        const formData = new FormData();
        formData.append("avatar", file); // field name chính xác

        const res = await axios.post("/user/me/avatar", formData);  

        return res.data;
    },
    getAllUsers: async () => {
        const res = await axios.get("/user");
        return res.data;
    }
};