import z from 'zod'

export const signup_schema = z.object({
    email: z.email("Please enter a valid email address")
        .min(1, "Email is required"),
    password: z.string()
        .min(8, "Password must be at least 8 characters long")
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain at least one uppercase letter, one lowercase letter, and one number"),
    role: z.enum(["admin", "user"]).refine((val) => val === "admin" || val === "user", {
        message: "Role must be either 'admin' or 'user'"
    }),
});

export const login_schema = z.object({
    email: z.email("Please enter a valid email address")
        .min(1, "Email is required"),
    password: z.string()
        .min(1, "Password is required")
});

export const onramp_schema = z.object({
    amount: z.number()
        .positive("Amount must be positive")
        .min(0.01, "Minimum amount is ₹0.01")
});

export const market_schema = z.object({
    title: z.string()
        .min(1, "Title is required")
        .max(100, "Title must be less than 100 characters")
        .trim(),
    description: z.string()
        .min(1, "Description is required")
        .max(1000, "Description must be less than 1000 characters")
        .trim(),
    sourceOfTruth: z.string()
        .min(1, "Source of Truth is required")
        .max(200, "Source of Truth must be less than 200 characters")
        .url("Please enter a valid URL for the source of truth")
        .trim(),
    endDate: z.string()
        .min(1, "End date is required")
        .refine((dateString) => {
            const date = new Date(dateString);
            return !isNaN(date.getTime()) && date > new Date();
        }, {
            message: "Please enter a valid future date"
        }),
    imageUrl: z.url("Please enter a valid image URL")
        .min(1, "Image URL is required")
        .trim(),
})


export type signup_schema = z.infer<typeof signup_schema>;
export type login_schema = z.infer<typeof login_schema>;
export type onramp_schema = z.infer<typeof onramp_schema>;
export type market_schema = z.infer<typeof market_schema>;