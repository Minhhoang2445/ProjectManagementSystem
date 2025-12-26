
export interface Task {
    id: number;
    title: string;
    description?: string;
    status: "to_do" | "in_progress" | "review" | "done" | "cancelled";
    priority: "low" | "medium" | "high" | "urgent";
    dueDate?: string;
    projectId: number;
    assigneeId?: number;
    createdAt: string;
    updatedAt: string;
    attachments?: TaskAttachment[];
    assignee?: {
        id: number;
        firstName: string;
        lastName: string;
        avatar?: string;
        email: string;
    };
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
export interface TaskAttachment {
    id: number;
    fileName: string;
    filePath: string;
    fileType: string;
    fileSize: number;
    createdAt: string;
}