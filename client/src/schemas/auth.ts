import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters"),
});

export const registerSchema = z.object({
  username: z
    .string()
    .min(1, "Username is required")
    .min(4, "Username must be at least 4 characters")
    .max(20, "Username must be less than 20 characters")
    .regex(/^\w+$/, "Username can only contain letters, numbers, and underscores"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/\d/, "Password must contain at least one number"),
  passwordConfirm: z
    .string()
    .min(1, "Please confirm your password"),
}).refine(
  (data) => data.password === data.passwordConfirm,
  {
    message: "Passwords do not match",
    path: ["passwordConfirm"],
  }
);

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
