import { ACCESS_TOKEN_EXPIRES_IN, JWT_SECRET_TOKEN } from "@config/variables";
import { REFRESH_TOKEN_MAX_AGE_MS } from "@helpers/cookies";
import jwt, { type SignOptions, type VerifyOptions } from "jsonwebtoken";

import type { UserId } from "../types/brand";

// Identidad y algoritmo fijos para todos los JWT de esta app.
const TOKEN_ISSUER = "mern-template-api";
const TOKEN_AUDIENCE = "mern-template-web";
const TOKEN_ALGORITHM = "HS256";

// Opciones compartidas al firmar (garantizan quién emite el token y para quién).
const SIGN_BASE = {
  algorithm: TOKEN_ALGORITHM,
  audience: TOKEN_AUDIENCE,
  issuer: TOKEN_ISSUER,
} as const;

// Opciones al verificar: exige el mismo algoritmo (bloquea ataques "alg: none"),
// emisor y audiencia. La caducidad (`exp`) la valida `jsonwebtoken` automáticamente.
const VERIFY_OPTIONS: VerifyOptions = {
  algorithms: [TOKEN_ALGORITHM],
  audience: TOKEN_AUDIENCE,
  issuer: TOKEN_ISSUER,
};

export interface VerifiedAccessToken {
  readonly userId: string;
  readonly issuedAt: number;
}

export interface VerifiedRefreshToken {
  readonly userId: string;
  readonly jti: string;
}

// Tipado seguro (unknown) para validar manualmente los campos antes de confiar en ellos.
interface DecodedClaims {
  readonly type?: unknown;
  readonly sub?: unknown;
  readonly iat?: unknown;
  readonly jti?: unknown;
}

/**
 * Firma un Access Token de corta duración (~15 min).
 *
 * Sobre `subject` (`sub`):
 * - `sub` es el claim estándar de JWT para identificar al dueño del token.
 * - Pasamos `subject: userId` en las opciones (en vez de `{ userId }` en el payload)
 *   para que `jsonwebtoken` lo añada automáticamente al payload bajo el nombre estándar `sub`.
 * - Usamos el `userId` (y no email/nombre) porque el ID nunca cambia, el payload es
 *   legible en base64 y así el servidor siempre consulta los datos frescos en la BD.
 */
export function signAccessToken(userId: UserId): string {
  return jwt.sign({ type: "access" }, JWT_SECRET_TOKEN, {
    ...SIGN_BASE,
    subject: userId, // Se guarda en el payload como `sub`
    expiresIn: ACCESS_TOKEN_EXPIRES_IN as NonNullable<SignOptions["expiresIn"]>,
  });
}

/**
 * Firma un Refresh Token de larga duración (~7 días, sincronizado con la cookie).
 * Lleva `type: "refresh"` para que nunca pueda usarse como access token,
 * el `userId` en el claim estándar `sub` y un `jti` único por emisión.
 * Su rotación y revocación se gestionan en `TokenService`.
 */
export function signRefreshToken(userId: UserId, jti: string): string {
  return jwt.sign({ type: "refresh" }, JWT_SECRET_TOKEN, {
    ...SIGN_BASE,
    subject: userId, // Se guarda en el payload como `sub`
    jwtid: jti, // Se guarda en el payload como `jti`
    expiresIn: REFRESH_TOKEN_MAX_AGE_MS / 1000,
  });
}

/**
 * Valida un JWT en tres pasos:
 * 1. Firma, caducidad, emisor y audiencia (`jwt.verify`).
 * 2. Estructura válida (debe ser un objeto).
 * 3. Tipo exacto (`access` o `refresh`) y presencia de `sub` (el `userId`).
 */
function verifyTypedToken(
  token: string,
  expectedType: "access" | "refresh",
): Promise<DecodedClaims> {
  return new Promise((resolve, reject) => {
    jwt.verify(token, JWT_SECRET_TOKEN, VERIFY_OPTIONS, (err, decoded) => {
      if (err) {
        reject(err);
        return;
      }
      if (typeof decoded !== "object" || decoded === null) {
        reject(new Error("Unexpected token payload"));
        return;
      }
      const claims = decoded as DecodedClaims;
      if (claims.type !== expectedType || typeof claims.sub !== "string") {
        reject(new Error("Unexpected token claims"));
        return;
      }
      resolve(claims);
    });
  });
}

/**
 * Verifica un Access Token y devuelve el `userId` (extraído de `sub`) y su fecha de emisión (`issuedAt`).
 * El middleware usa `issuedAt` para rechazar tokens emitidos antes de un cambio de contraseña.
 */
export async function verifyAccessToken(token: string): Promise<VerifiedAccessToken> {
  const claims = await verifyTypedToken(token, "access");
  if (typeof claims.iat !== "number") {
    throw new Error("The token has no issued-at claim");
  }
  return { userId: claims.sub as string, issuedAt: claims.iat };
}

/**
 * Verifica un Refresh Token y devuelve el `userId` (extraído de `sub`) y su identificador único (`jti`).
 */
export async function verifyRefreshToken(token: string): Promise<VerifiedRefreshToken> {
  const claims = await verifyTypedToken(token, "refresh");
  if (typeof claims.jti !== "string") {
    throw new Error("The token has no jti claim");
  }
  return { userId: claims.sub as string, jti: claims.jti };
}
