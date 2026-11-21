import { createHash, randomUUID } from "node:crypto";

import { REFRESH_TOKEN_MAX_AGE_MS } from "@helpers/cookies";
import { toUserId } from "@helpers/id";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "@helpers/jwt";
import { RefreshTokenModel } from "@models/refreshToken";

import type { UserId } from "../types/brand";

export interface TokenPair {
  readonly accessToken: string;
  readonly refreshToken: string;
}

export interface RotatedSession {
  readonly userId: UserId;
  readonly tokens: TokenPair;
}

// Duración del refresh token (sincronizada con la cookie para que caduquen a la vez).
const REFRESH_TOKEN_TTL_MS = REFRESH_TOKEN_MAX_AGE_MS;

// Margen de 30s para evitar falsos positivos de robo cuando dos pestañas
// del mismo navegador intentan renovar el mismo token al mismo tiempo.
const REFRESH_ROTATION_GRACE_MS = 30 * 1000;

/**
 * Convierte el token en un hash SHA-256 irreversible.
 * Guardamos solo el hash en BD para que, si se filtra la base de datos,
 * nadie pueda usar esos registros para iniciar sesión.
 */
function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Gestiona el ciclo de vida de las sesiones con dos tokens:
 * - Access Token (corto, ~15m): viaja en cada petición y NO se guarda en BD.
 * - Refresh Token (largo, ~7d): sirve para pedir nuevos Access Tokens. Se guarda
 *   hasheado en BD y es de un solo uso (rotación) para detectar robos.
 */
class TokenService {
  /**
   * Crea un nuevo par de tokens (usado en login, registro y tras cada rotación).
   * Guarda en BD solo el hash del refresh token; el access token es efímero.
   */
  async issueTokenPair(userId: UserId): Promise<TokenPair> {
    const refreshToken = signRefreshToken(userId, randomUUID());
    await RefreshTokenModel.create({
      tokenHash: hashToken(refreshToken),
      user: userId,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
    });

    return {
      accessToken: signAccessToken(userId),
      refreshToken,
    };
  }

  /**
   * Renueva una sesión consumiendo el refresh token actual y emitiendo uno nuevo.
   * Devuelve `null` si el token es inválido o si se detecta un posible robo.
   * `presentedToken` es el refresh token que el cliente envía en la cookie; no se confía en él.
   */
  async rotateRefreshToken(presentedToken: string): Promise<RotatedSession | null> {
    // 1. Validar firma, caducidad y que sea un token de tipo "refresh".
    try {
      await verifyRefreshToken(presentedToken);
    } catch {
      return null;
    }

    const tokenHash = hashToken(presentedToken);

    // 2. Consumir el token de forma atómica.
    // Solo se actualiza si aún está activo (`revokedAt: null`). Si llegan dos
    // peticiones a la vez, solo la primera entra aquí; la segunda recibirá `null`.
    const rotated = await RefreshTokenModel.findOneAndUpdate(
      { tokenHash, revokedAt: null },
      { revokedAt: new Date(), rotatedAt: new Date() },
    );

    // Si encontramos un documento activo, el token era válido y lo acabamos de rotar.
    if (rotated) {
      const userId = toUserId(String(rotated.user));
      return { userId, tokens: await this.issueTokenPair(userId) };
    }

    // 3. Si llegamos aquí, el token no estaba activo. Buscamos por qué.
    const stored = await RefreshTokenModel.findOne({ tokenHash });
    if (!stored) {
      // No existe en BD (token inventado o ya borrado automáticamente por caducidad).
      return null;
    }

    // Comprobamos si se acaba de rotar hace menos de 30s (otra pestaña ganó la carrera).
    const wasRotatedRecently =
      stored.rotatedAt !== null &&
      stored.rotatedAt !== undefined &&
      Date.now() - stored.rotatedAt.getTime() <= REFRESH_ROTATION_GRACE_MS;

    // 4. Si se usó hace más de 30s, asumimos robo (dos personas tienen el mismo token).
    // Por seguridad, cerramos TODAS las sesiones activas del usuario.
    if (!wasRotatedRecently) {
      // si entra aquí, es un uso ilegítimo: el token fue robado o reusado tras caducar.
      await RefreshTokenModel.updateMany(
        { user: stored.user, revokedAt: null },
        { revokedAt: new Date() },
      );
      return null;
    }

    // Estaba dentro de la ventana de gracia: es un uso legítimo concurrente.
    const userId = toUserId(String(stored.user));
    return {
      userId,
      tokens: await this.issueTokenPair(userId),
    };
  }

  /**
   * Cierra solo la sesión actual (Logout).
   * Si el token ya está caducado o corrupto, se ignora sin lanzar error.
   */
  async revokeRefreshToken(presentedToken: string): Promise<void> {
    try {
      await verifyRefreshToken(presentedToken);
    } catch {
      return;
    }
    await RefreshTokenModel.updateOne(
      { tokenHash: hashToken(presentedToken) },
      { revokedAt: new Date() },
    );
  }

  /**
   * Cierra TODAS las sesiones activas del usuario (ej. al cambiar la contraseña).
   */
  async revokeAllForUser(userId: UserId): Promise<void> {
    await RefreshTokenModel.updateMany(
      { user: userId, revokedAt: null },
      { revokedAt: new Date() },
    );
  }
}

export default new TokenService();
