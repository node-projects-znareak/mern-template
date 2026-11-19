import { ACCESS_TOKEN_EXPIRES_IN, JWT_SECRET_TOKEN } from "@config/variables";
import jwt, { type SignOptions, type VerifyOptions } from "jsonwebtoken";

import type { UserId } from "../types/brand";

const TOKEN_ISSUER = "mern-template-api";
const TOKEN_AUDIENCE = "mern-template-web";
const TOKEN_ALGORITHM = "HS256";

const SIGN_BASE = {
  algorithm: TOKEN_ALGORITHM,
  audience: TOKEN_AUDIENCE,
  issuer: TOKEN_ISSUER,
} as const;

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

interface DecodedClaims {
  readonly type?: unknown;
  readonly sub?: unknown;
  readonly iat?: unknown;
  readonly jti?: unknown;
}

export function signAccessToken(userId: UserId): string {
  return jwt.sign({ type: "access" }, JWT_SECRET_TOKEN, {
    ...SIGN_BASE,
    subject: userId,
    expiresIn: ACCESS_TOKEN_EXPIRES_IN as NonNullable<SignOptions["expiresIn"]>,
  });
}

export function signRefreshToken(userId: UserId, jti: string): string {
  return jwt.sign({ type: "refresh" }, JWT_SECRET_TOKEN, {
    ...SIGN_BASE,
    subject: userId,
    jwtid: jti,
    expiresIn: "7d",
  });
}

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

export async function verifyAccessToken(token: string): Promise<VerifiedAccessToken> {
  const claims = await verifyTypedToken(token, "access");
  if (typeof claims.iat !== "number") {
    throw new Error("The token has no issued-at claim");
  }
  return { userId: claims.sub as string, issuedAt: claims.iat };
}

export async function verifyRefreshToken(token: string): Promise<VerifiedRefreshToken> {
  const claims = await verifyTypedToken(token, "refresh");
  if (typeof claims.jti !== "string") {
    throw new Error("The token has no jti claim");
  }
  return { userId: claims.sub as string, jti: claims.jti };
}
