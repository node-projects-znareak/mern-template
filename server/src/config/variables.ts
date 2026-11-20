import { envSchema } from "@helpers/env";
import type { Options as RateLimitOptions } from "express-rate-limit";

import type { Environment } from "../types/env";

const env = envSchema.parse(process.env);

export const {
  DUMMY_PASSWORD,
  ENVIROMENT,
  HOST,
  PORT,
  JWT_SECRET_TOKEN,
  JWT_SALT_TOKEN,
  ACCESS_TOKEN_EXPIRES_IN,
} = env;

export const TRUST_PROXY: boolean = env.TRUST_PROXY === "true";

export const TRUST_PROXY_HOPS: number | undefined = env.TRUST_PROXY_HOPS;

export const HTTPS_CERT_PATH: string = env.HTTPS_CERT_PATH;
export const HTTPS_KEY_PATH: string = env.HTTPS_KEY_PATH;

export const COOKIE_DOMAIN: string = env.COOKIE_DOMAIN;

export const IS_HTTPS: boolean = HTTPS_CERT_PATH.length > 0 && HTTPS_KEY_PATH.length > 0;

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
  max: 30,
} satisfies Partial<RateLimitOptions>;

export const API = {
  MONGO_DB_URL,
  JWT_SECRET_TOKEN: env.JWT_SECRET_TOKEN,
  IS_PRODUCTION,
  IS_HTTPS,
  ENVIROMENT,
  CORS_ALLOWED_DOMAINS: env.CORS_ALLOWED_DOMAINS,
  RATE_LIMITS,
  AUTH_RATE_LIMITS,
  JWT_SALT_TOKEN: env.JWT_SALT_TOKEN,
} satisfies {
  MONGO_DB_URL: string;
  JWT_SECRET_TOKEN: string;
  IS_PRODUCTION: boolean;
  IS_HTTPS: boolean;
  ENVIROMENT: Environment;
  CORS_ALLOWED_DOMAINS: string[];
  RATE_LIMITS: Partial<RateLimitOptions>;
  AUTH_RATE_LIMITS: Partial<RateLimitOptions>;
  JWT_SALT_TOKEN: number;
};
