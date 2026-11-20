import { IS_PRODUCTION } from "@config/variables";
import boom, { type Boom } from "@hapi/boom";
import { isRequestAjaxOrApi, toErrorMessage } from "@helpers/index";
import { logger } from "@helpers/logger";
import type { ErrorRequestHandler, Express } from "express";

// eslint-disable-next-line max-params
const logErrors: ErrorRequestHandler = (err: unknown, req, _res, next) => {
  const errorText = toErrorMessage(err);
  logger.error({ requestId: req.id ?? "unknown", err }, errorText);
  next(err);
};

function isBoomError(err: unknown): err is Boom {
  return typeof err === "object" && err !== null && (err as { isBoom?: unknown }).isBoom === true;
}

// eslint-disable-next-line max-params
const wrapErrors: ErrorRequestHandler = (err: unknown, _req, _res, next) => {
  if (isBoomError(err)) {
    next(err);
    return;
  }
  next(boom.badImplementation(toErrorMessage(err)));
};

// eslint-disable-next-line max-params
const clientErrorHandling: ErrorRequestHandler = (err: unknown, req, res, next) => {
  if (!isBoomError(err)) {
    next(err);
    return;
  }

  const { statusCode, payload } = err.output;

  if (isRequestAjaxOrApi(req) || res.headersSent) {
    const response: Record<string, unknown> = { ...payload, requestId: req.id };
    if (IS_PRODUCTION && statusCode < 500) {
      response.errorDescription = err.message;
    }
    res.status(statusCode).json(response);
    return;
  }

  next(err);
};

export default function wrapServerErrors(app: Express): void {
  if (typeof app.use !== "function") {
    throw new Error("The `app` param isn't a instace of express");
  }

  app.use(logErrors);
  app.use(wrapErrors);
  app.use(clientErrorHandling);
}
