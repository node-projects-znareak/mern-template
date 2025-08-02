const { z } = require("zod");

const envSchema = z.object({
  PORT: z.coerce.number().min(1).max(65535),
  HOST: z.string(),

  ENVIROMENT: z.enum(["development", "production", "test"]).default("development"),

  JWT_SECRET_TOKEN: z.string().min(32, "JWT_SECRET_TOKEN must be at least 32 characters long"),
  JWT_SALT_TOKEN: z.coerce.number().int().min(1),

  CORS_ALLOWED_DOMAINS: z.string().transform((v) =>
    v
      .replace(/(^"|"$)/g, "")
      .split(",")
      .map((s) => s.trim())
  ),

  MONGO_DB_URI_DEVELOPMENT: z.url(),
  MONGO_DB_URI_PRODUCTION: z.url(),
});

module.exports = {
  envSchema,
};
