import z from 'zod'

export const signup_schema = z.object({
    email: z.email().min(1),
    password: z.string().min(8),
    role: z.enum(["admin", "user"]),
});

export const login_schema = z.object({
    email: z.email().min(1),
    password: z.string().min(8),
});

export type signup_schema = z.infer<typeof signup_schema>;
export type login_schema = z.infer<typeof login_schema>;