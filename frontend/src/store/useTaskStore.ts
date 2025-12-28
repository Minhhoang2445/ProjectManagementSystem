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

    fetchTaskById: async (projectId: number, id: number) => {
        try {
            set({ isLoading: true });
            const task = await taskService.getTaskById(projectId, id);
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
    },
    deleteTask: async (projectId: number, taskId: number) => {
        try {
            set({ isLoading: true });
            await taskService.deleteTask(projectId, taskId);
            set({ tasks: get().tasks.filter(task => task.id !== taskId) });
            toast.success("Xóa công việc thành công!");
        } catch (error) {
            console.error(error);
            toast.error("Xóa công việc thất bại");
        } finally {
            set({ isLoading: false });
        }
    },
    updateTask: async (projectId: number, taskId: number, data: any) => {
        try {
            set({ isLoading: true });
            const updatedTask = await taskService.updateTask(projectId, taskId, data);
            set({
                tasks: get().tasks.map(task =>
                    task.id === taskId ? updatedTask : task
                ),
            });
            toast.success("Cập nhật công việc thành công!");
        } catch (error) {
            console.error(error);
            toast.error("Cập nhật công việc thất bại");
        }
        finally {
            set({ isLoading: false });
        }
    },
    uploadTaskAttachments: async (projectId: number, taskId: number, files: FileList) => {
        try {
            set({ isLoading: true });

            const formData = new FormData();
            Array.from(files).forEach((file) => {
                formData.append("files", file);
            });

            await taskService.uploadTaskAttachments(projectId, taskId, formData);

            toast.success("Upload file thành công!");
        } catch (error) {
            console.error(error);
            toast.error("Upload file thất bại");
        } finally {
            set({ isLoading: false });
        }
    },

}));
