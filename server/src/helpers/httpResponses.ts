import type { Response } from "express";

import type { ApiErrorPayload, ApiSuccessPayload } from "../types/api";

interface ValidationErrorLike {
  name?: unknown;
  errors?: unknown;
  message?: unknown;
}

function toValidationErrorLike(value: unknown): ValidationErrorLike {
  return typeof value === "object" && value !== null ? value : { message: value };
}

export function validationError(res: Response, data: unknown): Response {
  const candidate = toValidationErrorLike(data);
  return res.status(400).json({
    ok: false,
    error: typeof candidate.name === "string" ? candidate.name : "Validation Error",
    data: candidate.errors ?? candidate.message ?? data,
    statusCode: 400,
  } satisfies ApiErrorPayload<unknown>);
}

export function error(
  res: Response,
  data: unknown = "An error occurred while processing the request",
  statusCode = 400,
): Response {
  return res.status(statusCode).json({
    ok: false,
    error: true,
    data,
    statusCode,
  } satisfies ApiErrorPayload<unknown>);
}

export function success(
  res: Response,
  data: unknown = "The request processed successfully",
  statusCode = 200,
): Response {
  return res.status(statusCode).json({
    ok: true,
    error: false,
    data,
    statusCode,
  } satisfies ApiSuccessPayload<unknown>);
}
