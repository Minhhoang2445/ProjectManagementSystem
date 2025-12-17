import { create } from "zustand";
import { toast } from "sonner";
import { taskService } from "@/services/taskService.ts";
import type {  taskState } from "@/types/store.ts";


export const useTaskStore = create<taskState>((set, get) => ({
    tasks: [],
    selectedTask: null,
    isLoading: false,

    fetchTasks: async () => {
        try {
            set({ isLoading: true });
            const tasks = await taskService.getAll();
            set({ tasks });
            toast.success("Lấy danh sách dự án thành công");
        } catch (error) {
            console.error(error);
            toast.error("Không thể tải danh sách dự án");
        } finally {
            set({ isLoading: false });
        }
    },

    fetchTaskById: async (id: number) => {
        try {
            set({ isLoading: true });
            const task = await taskService.getTaskById(id);
            set({ selectedTask: task });
        } catch (error) {
            console.error(error);
            toast.error("Không thể tải thông tin dự án");
        } finally {
            set({ isLoading: false });
        }
    },

    
}));
