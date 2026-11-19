import { envSchema } from "@helpers/env";
import type { Options as RateLimitOptions } from "express-rate-limit";

import type { Environment } from "../types/env";

const env = envSchema.parse(process.env);

export const { ENVIROMENT, HOST, PORT, JWT_SECRET_TOKEN, JWT_SALT_TOKEN } = env;

export const IS_PRODUCTION: boolean = ENVIROMENT === "production";

export const MONGO_DB_URL: string = IS_PRODUCTION
  ? env.MONGO_DB_URI_PRODUCTION
  : env.MONGO_DB_URI_DEVELOPMENT;

export const RATE_LIMITS = {
  windowMs: 2 * 60 * 1000,
  max: 500,
} satisfies Partial<RateLimitOptions>;

export const AUTH_RATE_LIMITS = {
  windowMs: 15 * 60 * 1000,
  max: 5,
} satisfies Partial<RateLimitOptions>;

export const API = {
  MONGO_DB_URL,
  JWT_SECRET_TOKEN: env.JWT_SECRET_TOKEN,
  IS_PRODUCTION,
  ENVIROMENT,
  CORS_ALLOWED_DOMAINS: env.CORS_ALLOWED_DOMAINS,
  RATE_LIMITS,
  AUTH_RATE_LIMITS,
  JWT_SALT_TOKEN: env.JWT_SALT_TOKEN,
} satisfies {
  MONGO_DB_URL: string;
  JWT_SECRET_TOKEN: string;
  IS_PRODUCTION: boolean;
  ENVIROMENT: Environment;
  CORS_ALLOWED_DOMAINS: string[];
  RATE_LIMITS: Partial<RateLimitOptions>;
  AUTH_RATE_LIMITS: Partial<RateLimitOptions>;
  JWT_SALT_TOKEN: number;
};
