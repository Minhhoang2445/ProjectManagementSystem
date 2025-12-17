import { z } from "zod";

export const projectSchema = z.object({
    name: z.string().min(1, "Project name is required"),
    description: z.string().min(1, "Description is required"),

    startDate: z.string()
        .refine((date) => !isNaN(Date.parse(date)), { message: "Invalid start date format" }),

    endDate: z.string()
        .refine((date) => !isNaN(Date.parse(date)), { message: "Invalid end date format" }),

    members: z.array(
        z.object({
            userId: z.number().int().positive({ message: "User ID must be a positive integer" }),
            role: z.enum(["project_leader", "member"], {
                errorMap: () => ({ message: "Invalid project role" }),
            })
        })
    )
        .min(1, "Project must have at least one member"),
})
    .superRefine((data, ctx) => {
        // Chuyển kiểu về Date để so sánh
        const start = new Date(data.startDate);
        const end = new Date(data.endDate);

        if (start > end) {
            ctx.addIssue({
                code: "custom",
                path: ["endDate"],
                message: "End date must be after start date",
            });
        }
    });
