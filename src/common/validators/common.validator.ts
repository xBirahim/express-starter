import { z } from "zod";

export const password = z.string().min(6);
// .refine((password) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(password), {
//     message: "Password must contain uppercase, lowercase, number and special character",
// });

export const email = z
    .string()
    .email()
    .transform((email) => email.toLowerCase());

export const token = z.string();

export const pagination = z.object({
    page: z.string().regex(/^\d+$/).transform(Number).default("1"),
    limit: z.string().regex(/^\d+$/).transform(Number).default("10"),
    sort: z.enum(["asc", "desc"]).default("desc"),
});

export const uuid = z.string().uuid();
