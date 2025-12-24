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
    getTasksByProjectId: async (projectId: number) => {
        try {
            set({ isLoading: true });
            const tasks = await taskService.getTasksByProjectId(projectId);
            set({ tasks });
        } catch (error) {
            console.error(error);
            toast.error("Không thể tải danh sách công việc cho dự án");
        } finally {
            set({ isLoading: false });
        }
    },
    getUserTasks: async () => {
        try {
            set({ isLoading: true });
            const tasks = await taskService.getUserTasks();
            set({ tasks });
        } catch (error) {
            console.error(error);
            toast.error("Không thể tải danh sách công việc của bạn");
        } finally {
            set({ isLoading: false });
        }
    },
    createTask: async (id: number, data: any) => {
        try {
            set({ isLoading: true });
            const newTask = await taskService.createTask(id, data);
            set({ tasks: [...get().tasks, newTask] });
            toast.success("Tạo công việc thành công!");
        } catch (error) {
            console.error(error);
            toast.error("Tạo công việc thất bại");
        } finally {
            set({ isLoading: false });
        }
    }
}));
