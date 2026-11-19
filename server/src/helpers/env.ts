import { z } from "zod";

export const ENVIRONMENTS = ["development", "production", "test"] as const;
export type Environment = (typeof ENVIRONMENTS)[number];

export const envSchema = z.object({
  PORT: z.coerce.number().min(1).max(65535).default(5000),
  HOST: z.string().optional(),

  ENVIROMENT: z.enum(ENVIRONMENTS).default("development"),

  JWT_SECRET_TOKEN: z.string().min(32, "JWT_SECRET_TOKEN must be at least 32 characters long"),
  JWT_SALT_TOKEN: z.coerce.number().int().min(1),

  CORS_ALLOWED_DOMAINS: z.string().transform((value) =>
    value
      .replace(/(^"|"$)/g, "")
      .split(",")
      .map((s) => s.trim()),
  ),

  MONGO_DB_URI_DEVELOPMENT: z.url(),
  MONGO_DB_URI_PRODUCTION: z.url(),
});

export type Env = z.infer<typeof envSchema>;
