import { z } from "zod";

const dateStringSchema = z.string().refine((value) => !isNaN(Date.parse(value)), {
    message: "Invalid date format",
});

const memberSchema = z.object({
    userId: z.number().int().positive({ message: "User ID must be a positive integer" }),
    role: z.enum(["project_leader", "member"], {
        errorMap: () => ({ message: "Invalid project role" }),
    }),
});

const statusSchema = z.enum(["planned", "in_progress", "completed", "cancelled"], {
    errorMap: () => ({ message: "Invalid project status" }),
});

export const projectSchema = z
    .object({
        name: z.string().min(1, "Project name is required"),
        description: z.string().min(1, "Description is required"),
        status: statusSchema.default("planned"),
        startDate: dateStringSchema,
        endDate: dateStringSchema,
        members: z.array(memberSchema).min(1, "Project must have at least one member"),
    })
    .superRefine((data, ctx) => {
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

export const projectUpdateSchema = z
    .object({
        name: z.string().min(1, "Project name is required").optional(),
        description: z.string().min(1, "Description is required").optional(),
        status: statusSchema.optional(),
        startDate: dateStringSchema.optional(),
        endDate: dateStringSchema.optional(),
        members: z.array(memberSchema).min(1, "At least one member is required").optional(),
    })
    .superRefine((data, ctx) => {
        if (data.startDate && data.endDate) {
            const start = new Date(data.startDate);
            const end = new Date(data.endDate);

            if (start > end) {
                ctx.addIssue({
                    code: "custom",
                    path: ["endDate"],
                    message: "End date must be after start date",
                });
            }
        }
    })
    .refine(
        (data) => Object.values(data).some((value) => value !== undefined),
        { message: "At least one field must be provided for update" }
    );
