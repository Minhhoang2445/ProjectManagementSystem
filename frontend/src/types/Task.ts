
export interface Task {
    id: number;
    title: string;
    description?: string;
    status: "to_do" | "in_progress" | "review" | "done";
    priority: "low" | "medium" | "high" | "urgent";
    dueDate?: string;
    projectId: number;
    assigneeId?: number;
    createdAt: string;
    updatedAt: string;
}
export type CreateTaskFormData = Omit<Task, "id" | "createdAt" | "updatedAt" | "projectId"> & {
    
    assigneeId?: number;
};
import type { User } from "@/types/User";
export interface ProjectMemberSummary {
    userId: number;
    firstName: User["firstName"];
    lastName: User["lastName"];
}