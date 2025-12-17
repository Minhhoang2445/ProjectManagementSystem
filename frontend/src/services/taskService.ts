import api from "@/lib/axios"
import { get } from "react-hook-form";
export const taskService = {
    getAll: async () => {
        const res = await api.get("/project/task");
        return res.data;
    },
    getTaskById: async (taskId: number) => {
        const res = await api.get(`/project/task/${taskId}`);
        return res.data;
    }

};