import { IS_PRODUCTION } from "@config/variables";
import boom, { Boom } from "@hapi/boom";
import { toErrorMessage } from "@helpers/index";
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

/** body-parser marca sus errores con un `status` 4xx y un `type`
 *  (`entity.parse.failed` → 400, `entity.too.large` → 413, etc.). */
function getClientErrorStatus(err: unknown): number | undefined {
  if (typeof err !== "object" || err === null) {
    return undefined;
  }
  const { status, statusCode } = err as { status?: unknown; statusCode?: unknown };
  const code = status ?? statusCode;
  return typeof code === "number" && code >= 400 && code < 500 ? code : undefined;
}

// eslint-disable-next-line max-params
const wrapErrors: ErrorRequestHandler = (err: unknown, _req, _res, next) => {
  if (isBoomError(err)) {
    next(err);
    return;
  }

  // Errores del body-parser (JSON malformado → 400, body demasiado grande → 413,
  // charset no soportado → 415...) ya traen un status 4xx: se devuelven tal cual
  // en vez de convertirse en un 500 genérico.
  const clientStatus = getClientErrorStatus(err);
  if (clientStatus !== undefined) {
    next(new Boom(toErrorMessage(err), { statusCode: clientStatus }));
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

  if (res.headersSent) {
    next(err);
    return;
  }

  // Este backend solo sirve JSON (la API); el SPA lo entrega nginx. Así que los
  // errores siempre se devuelven como JSON, sin depender del header Accept ni de
  // `X-Requested-With` (que axios no envía y hacía caer en la página HTML por defecto).
  const { statusCode, payload } = err.output;
  const response: Record<string, unknown> = { ...payload, requestId: req.id };
  if (IS_PRODUCTION && statusCode < 500) {
    response.errorDescription = err.message;
  }
  res.status(statusCode).json(response);
};

export default function wrapServerErrors(app: Express): void {
  if (typeof app.use !== "function") {
    throw new Error("The `app` param isn't a instace of express");
  }

  app.use(logErrors);
  app.use(wrapErrors);
  app.use(clientErrorHandling);
}
