import { z } from "zod";

export const registerSchema = z.object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().email(),
    password: z.string(),
    designation: z.string(),
    department: z.string(),
});
export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
});