import { randomUUID } from "node:crypto";

import { API } from "@config/variables";
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

/** Elimina (mutando en lugar) las claves con `$` o `.` para evitar inyección NoSQL.
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
    if (key.startsWith("$") || key.includes(".")) {
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

export const SECURITY_MIDDLEWARES: RequestHandler[] = [
  helmet(),
  contentSecurityPolicy({
    useDefaults: true,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
    reportOnly: false,
  }),
  hpp(),
  rateLimit(API.RATE_LIMITS),
  NO_SQL_INJECTION_GUARD,
];

export const CORS_MIDDLEWARE: RequestHandler = cors({
  origin: API.CORS_ALLOWED_DOMAINS,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Authorization", "Content-Type"],
});
