import { JWT_SECRET_TOKEN } from "@config/variables";
import type { PublicUser } from "@models/user";
import jwt, { type VerifyOptions } from "jsonwebtoken";

import type { UserJwtPayload } from "../types/auth";

export function toUserJwtPayload(user: PublicUser): UserJwtPayload {
  return {
    _id: String(user._id),
    email: user.email,
    name: user.name,
  };
}

export function createUserJwt(payload: UserJwtPayload): string {
  return jwt.sign(payload, JWT_SECRET_TOKEN, {
    expiresIn: "75d",
  });
}

export function isUserJwtPayload(payload: unknown): payload is UserJwtPayload {
  if (typeof payload !== "object" || payload === null) {
    return false;
  }
  const candidate = payload as Partial<UserJwtPayload>;
  return (
    typeof candidate._id === "string" &&
    typeof candidate.email === "string" &&
    typeof candidate.name === "string"
  );
}

export function getInfoFromUserJwt(
  token: string,
  options: VerifyOptions = {},
): Promise<UserJwtPayload> {
  return new Promise((resolve, reject) => {
    jwt.verify(token, JWT_SECRET_TOKEN, options, (err, payload) => {
      if (err) {
        reject(err);
        return;
      }
      if (isUserJwtPayload(payload)) {
        resolve(payload);
        return;
      }
      reject(new Error("The token payload has an unexpected shape"));
    });
  });
}
