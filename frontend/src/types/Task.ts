
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