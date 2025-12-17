import { create } from "zustand";
import { toast } from "sonner";
import { projectService } from "@/services/projectService.ts";
import type { projectState } from "@/types/store.ts";


export const useAdminStore = create<projectState>((set, get) => ({
    projects: [],
    selectedProject: null,
    isLoading: false,

    fetchProjects: async () => {
        try {
            set({ isLoading: true });
            const projects = await projectService.getAll();
            set({ projects });
            toast.success("Lấy danh sách dự án thành công");
        } catch (error) {
            console.error(error);
            toast.error("Không thể tải danh sách dự án");
        } finally {
            set({ isLoading: false });
        }
    },

    fetchProjectById: async (id: number) => {
        try {
            set({ isLoading: true });
            const project = await projectService.getProjectById(id);
            set({ selectedProject: project });
        } catch (error) {
            console.error(error);
            toast.error("Không thể tải thông tin dự án");
        } finally {
            set({ isLoading: false });
        }
    },

    createProject: async (
        name,
        description,
        startDate,
        endDate,
        members 
    ) => {
        try {
            set({ isLoading: true });

            const project = await projectService.create(
                name,
                description ?? null,
                startDate ?? null,
                endDate ?? null,
                members 
            );

            // cập nhật store, thêm project mới vào list
            set({ projects: [...get().projects, project] });

            toast.success("Tạo dự án thành công!");
        } catch (error) {
            console.error(error);
            toast.error("Tạo dự án thất bại");
        } finally {
            set({ isLoading: false });
        }
    },
    getUserProjects: async () => {
        try {
            set({ isLoading: true });
            const projects = await projectService.getUserProjects();
            set({ projects });
            toast.success("Lấy danh sách dự án thành công");
        }
        catch (error) {
            console.error(error);
            toast.error("Không thể tải danh sách dự án");
        } finally {
            set({ isLoading: false });
        }
    }
}));
