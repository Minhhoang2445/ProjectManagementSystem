import { z } from "zod";

export const createTaskSchema = z.object({
    title: z
        .string()
        .trim()
        .min(3, "Title must be at least 3 characters")
        .max(255, "Title is too long"),

    description: z
        .string()
        .trim()
        .max(1000, "Description is too long")
        .optional(),

    status: z
        .enum(["todo", "in_progress", "review", "done"])
        .optional()
        .default("todo"),

    priority: z
        .enum(["low", "medium", "high", "urgent"])
        .optional()
        .default("medium"),

    projectId: z
        .number({
            required_error: "Project ID is required",
            invalid_type_error: "Project ID must be a number",
        })
        .int()
        .positive(),

    teamId: z
        .number()
        .int()
        .positive()
        .optional()
        .nullable(),

    assigneeId: z
        .number({
            required_error: "Assignee ID is required",
            invalid_type_error: "Assignee ID must be a number",
        })
        .int()
        .positive(),

    startDate: z
        .string()
        .datetime()
        .optional(),

    dueDate: z
        .string()
        .datetime()
        .optional(),
})
    .refine(
        (data) => {
            if (data.startDate && data.dueDate) {
                return new Date(data.startDate) <= new Date(data.dueDate);
            }
            return true;
        },
        {
            message: "Start date must be before or equal to due date",
            path: ["dueDate"],
        }
    );