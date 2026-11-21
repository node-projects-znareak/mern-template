import { ACCESS_TOKEN_COOKIE } from "@helpers/cookies";
import { error } from "@helpers/httpResponses";
import { toErrorMessage, verifyAccessToken } from "@helpers/index";
import { logger } from "@helpers/logger";
import UserService from "@services/user";
import type { NextFunction, Request, Response } from "express";

import { toUserId } from "../helpers/id";

const JWT_TOKEN_PATTERN = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;

/**
 * Normaliza un token recibido (cookie o header): recorta espacios, quita comillas
 * que algunos proxies añaden y valida que tenga forma de JWT (tres partes base64url).
 */
function normalizeAccessToken(value: string): string | undefined {
  let token = value.trim();

  if (token.startsWith('"') && token.endsWith('"')) {
    token = token.slice(1, -1);
  }

  return JWT_TOKEN_PATTERN.test(token) ? token : undefined;
}

// Flujo de verificación del access token (protege todo /api/user):
//   1. Leer la cookie httpOnly `access_token` (único canal; sin Bearer).
//   2. Normalizar: algunos proxies añaden comillas o espacios al valor.
//   3. Verificar firma/exp/iss/aud/type → SOLO los fallos de token dan 401.
//   4. Cargar el usuario de la BD → un fallo de BD va al handler global (500).
//   5. Si passwordChangedAt es posterior al iat → sesión emitida antes del
//      cambio de contraseña → 401 (muere sin esperar a que expire el access).
//   6. Adjuntar req.session / req.user y continuar con la ruta.
export default async function requiredUserAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  // El token viaja SOLO en la cookie httpOnly: aceptar un header Bearer duplicaba
  // el canal de entrada (más superficie de robo de token) sin que el cliente lo use.
  const cookieToken = req.cookies?.[ACCESS_TOKEN_COOKIE] as string | undefined;
  const token = typeof cookieToken === "string" ? cookieToken : undefined;

  if (!token) {
    error(res, "The access token is missing", 401);
    return;
  }

  const normalizedToken = normalizeAccessToken(token);

  if (normalizedToken === undefined) {
    // Diagnóstico sin exponer el token: longitud y prefijo ayudan a detectar
    // comillas/espacios/proxies que corrompen la cookie.
    logger.warn(
      { requestId: req.id ?? "unknown" },
      `[auth] access token con formato inválido (longitud=${token.length}, prefijo="${token.slice(0, 12)}")`,
    );
    error(res, "The access token is malformed", 401);
    return;
  }

  let userId: string;
  let issuedAt: number;
  try {
    ({ userId, issuedAt } = await verifyAccessToken(normalizedToken));
  } catch (err) {
    // 401 esperado (token ausente/expirado/revocado): se loguea como warning,
    // no como error, para no ensuciar los logs de producción.
    logger.warn({ requestId: req.id ?? "unknown", err }, "Auth middleware rejected request");
    error(res, toErrorMessage(err), 401);
    return;
  }

  // Desde aquí los errores ya NO se convierten en 401: un fallo de base de datos
  // debe llegar al manejador global (500), no hacerse pasar por sesión inválida.
  const user = await UserService.getUserById(toUserId(userId));

  if (!user) {
    error(res, "The user does not exist, please try again", 401);
    return;
  }

  if (user.passwordChangedAt) {
    // iat del JWT tiene precisión de segundos; comparar en segundos evita invalidar
    // tokens emitidos en el mismo segundo en que se cambió la contraseña
    const passwordChangedAtSeconds = Math.floor(user.passwordChangedAt.getTime() / 1000);
    if (issuedAt < passwordChangedAtSeconds) {
      error(res, "The session is no longer valid, please log in again", 401);
      return;
    }
  }

  // eslint-disable-next-line require-atomic-updates -- la sesión se construye tras los awaits
  req.session = {
    user,
    userId: toUserId(user._id),
    token,
  };
  // eslint-disable-next-line require-atomic-updates
  req.user = user;

  next();
}
