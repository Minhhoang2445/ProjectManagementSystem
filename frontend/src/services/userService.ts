import axios from "../lib/axios";

export const userService = {
    uploadAvatar: async (file: File) => {
        const formData = new FormData();
        formData.append("avatar", file); // field name chính xác

        const res = await axios.post("/user/me/avatar", formData);  

        return res.data;
    }
};