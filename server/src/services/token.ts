import { createHash, randomUUID } from "node:crypto";

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

const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

// Ventana de gracia para rotaciones concurrentes: si un token recién rotado se
// presenta otra vez dentro de esta ventana (p. ej. dos pestañas refrescando a la
// vez con el mismo cookie), NO se considera robo y se emite un nuevo par.
const REFRESH_ROTATION_GRACE_MS = 30 * 1000;

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

class TokenService {
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

  async rotateRefreshToken(presentedToken: string): Promise<RotatedSession | null> {
    try {
      await verifyRefreshToken(presentedToken);
    } catch {
      return null;
    }

    const stored = await RefreshTokenModel.findOne({ tokenHash: hashToken(presentedToken) });
    if (!stored) {
      return null;
    }

    if (stored.revokedAt) {
      const wasRotatedRecently =
        stored.rotatedAt !== null &&
        stored.rotatedAt !== undefined &&
        Date.now() - stored.rotatedAt.getTime() <= REFRESH_ROTATION_GRACE_MS;

      if (!wasRotatedRecently) {
        // Reuso real (posible robo): se revoca toda la familia de tokens del usuario
        await RefreshTokenModel.updateMany(
          { user: stored.user, revokedAt: null },
          { revokedAt: new Date() },
        );
        return null;
      }

      // Rotación concurrente dentro de la ventana de gracia: continuar normalmente.
    } else {
      await RefreshTokenModel.updateOne(
        { _id: stored._id },
        { revokedAt: new Date(), rotatedAt: new Date() },
      );
    }

    const userId = toUserId(String(stored.user));
    return {
      userId,
      tokens: await this.issueTokenPair(userId),
    };
  }

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

  async revokeAllForUser(userId: UserId): Promise<void> {
    await RefreshTokenModel.updateMany(
      { user: userId, revokedAt: null },
      { revokedAt: new Date() },
    );
  }
}

export default new TokenService();
