import { z } from "zod";

export const ENVIRONMENTS = ["development", "production", "test"] as const;
export type Environment = (typeof ENVIRONMENTS)[number];

export const envSchema = z.object({
  PORT: z.coerce.number().min(1).max(65535).default(5000),
  HOST: z.string().optional(),

  ENVIROMENT: z.enum(ENVIRONMENTS).default("development"),

  JWT_SECRET_TOKEN: z.string().min(32, "JWT_SECRET_TOKEN must be at least 32 characters long"),
  JWT_SALT_TOKEN: z.coerce.number().int().min(1),
  DUMMY_PASSWORD: z.string().min(1),

  // TTL del access token en formato ms ("15m", "30s", "1h").
  // En desarrollo se puede bajar (p. ej. "10s") para probar la renovación vía refresh.
  ACCESS_TOKEN_EXPIRES_IN: z.string().min(1).default("15m"),

  CORS_ALLOWED_DOMAINS: z.string().transform((value) =>
    value
      .replace(/(^"|"$)/g, "")
      .split(",")
      .map((s) => s.trim()),
  ),

  TRUST_PROXY: z.enum(["true", "false"]).default("false"),

  // Opcionales: si ambos están definidos, el servidor escucha con HTTPS.
  // Útiles para simular producción en local con certificados (p. ej. mkcert).
  HTTPS_CERT_PATH: z.string().optional().default(""),
  HTTPS_KEY_PATH: z.string().optional().default(""),

  // Opcional: dominio padre compartido (p. ej. ".example.com") cuando frontend y API
  // viven en subdominios del mismo sitio (app.example.com + api.example.com).
  // Permite que la bandera session_present sea visible desde el frontend.
  COOKIE_DOMAIN: z.string().optional().default(""),

  MONGO_DB_URI_DEVELOPMENT: z.url(),
  MONGO_DB_URI_PRODUCTION: z.url(),
});

export type Env = z.infer<typeof envSchema>;
