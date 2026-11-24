import { randomUUID } from "node:crypto";

import { API } from "@config/variables";
import { error } from "@helpers/httpResponses";
import { logger } from "@helpers/logger";
import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type RequestHandler } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import contentSecurityPolicy from "helmet-csp";
import hpp from "hpp";

/**
 * Asigna un ID único a cada petición (acepta X-Request-Id del cliente) y lo
 * devuelve en la cabecera de respuesta para correlacionar logs y errores.
 */
export const REQUEST_ID_MIDDLEWARE: RequestHandler = (req, res, next) => {
  const incoming = req.get("x-request-id");
  const requestId = typeof incoming === "string" && incoming.length > 0 ? incoming : randomUUID();

  req.id = requestId;
  res.setHeader("X-Request-Id", requestId);
  next();
};

export const COMPRESSION_MIDDLEWARE: RequestHandler = compression();

export const PARSING_MIDDLEWARES: RequestHandler[] = [
  cookieParser(),
  express.json({ limit: "100kb" }),
  express.urlencoded({ extended: true, limit: "100kb" }),
];

/** Elimina (mutando en lugar) las claves con `$`, `.`, `__proto__`, `constructor`
 *  o `prototype` para evitar inyección NoSQL y prototype pollution.
 *  Sustituye a express-mongo-sanitize, que reasigna `req.query` y falla con Express 5. */
function sanitizeNoSqlInjection(value: unknown, onSanitize: (_key: string) => void): void {
  if (Array.isArray(value)) {
    for (const item of value) {
      sanitizeNoSqlInjection(item, onSanitize);
    }
    return;
  }

  if (value === null || typeof value !== "object") {
    return;
  }

  const record = value as Record<string, unknown>;
  for (const key of Object.keys(record)) {
    if (
      key.startsWith("$") ||
      key.includes(".") ||
      key === "__proto__" ||
      key === "constructor" ||
      key === "prototype"
    ) {
      onSanitize(key);
      delete record[key];
      continue;
    }
    sanitizeNoSqlInjection(record[key], onSanitize);
  }
}

export const NO_SQL_INJECTION_GUARD: RequestHandler = (req, _res, next) => {
  const onSanitize = (key: string): void => {
    logger.warn(`This request[${key}] is sanitized`);
  };

  if (req.body !== undefined && req.body !== null) {
    sanitizeNoSqlInjection(req.body as unknown, onSanitize);
  }
  if (req.query) {
    sanitizeNoSqlInjection(req.query, onSanitize);
  }
  if (req.params) {
    sanitizeNoSqlInjection(req.params, onSanitize);
  }

  next();
};

// Swagger UI inyecta scripts inline y la CSP estricta la rompería; la
// documentación solo se monta en desarrollo, así que la CSP se omite en /api-docs.
const CSP_MIDDLEWARE: RequestHandler = (req, res, next) => {
  if (req.path.startsWith("/api-docs")) {
    next();
    return;
  }
  contentSecurityPolicy({
    useDefaults: true,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
    reportOnly: false,
  })(req, res, next);
};

// Defensa CSRF para auth por cookies: rechaza métodos de escritura cuyo Origin
// no esté en la allowlist. Clave si se usa COOKIE_DOMAIN, porque SameSite=Lax
// no bloquea peticiones desde subdominios hermanos (son same-site).
export const CSRF_ORIGIN_GUARD: RequestHandler = (req, res, next) => {
  if (req.method === "GET" || req.method === "HEAD" || req.method === "OPTIONS") {
    next();
    return;
  }

  const origin = req.get("origin");

  // Sin cabecera Origin en una petición de escritura (curl/Postman/sin navegador):
  // se rechaza. En un navegador moderno toda petición POST/PUT/DELETE/PATCH,
  // incluso same-origin, lleva Origin, así que el frontend no se rompe.
  if (origin === undefined) {
    error(res, "Origin header is required", 403);
    return;
  }

  if (!API.CORS_ALLOWED_DOMAINS.includes(origin)) {
    error(res, "Origin not allowed", 403);
    return;
  }

  next();
};

export const SECURITY_MIDDLEWARES: RequestHandler[] = [
  // helmet pone su propia CSP por defecto; se desactiva para usar una sola
  // política (CSP_MIDDLEWARE), que además excluye /api-docs en desarrollo.
  helmet({ contentSecurityPolicy: false }),
  CSP_MIDDLEWARE,
  hpp(),
  rateLimit(API.RATE_LIMITS),
  CSRF_ORIGIN_GUARD,
  NO_SQL_INJECTION_GUARD,
];

export const CORS_MIDDLEWARE: RequestHandler = cors({
  origin: API.CORS_ALLOWED_DOMAINS,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
});
