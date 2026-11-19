import { ACCESS_TOKEN_COOKIE } from "@helpers/cookies";
import { error } from "@helpers/httpResponses";
import { toErrorMessage, verifyAccessToken } from "@helpers/index";
import UserService from "@services/user";
import type { NextFunction, Request, Response } from "express";

import { toUserId } from "../helpers/id";

export default async function requiredUserAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const cookieToken = req.cookies?.[ACCESS_TOKEN_COOKIE] as string | undefined;
    const header = req.get("authorization");
    const headerToken = header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : undefined;
    const token = typeof cookieToken === "string" ? cookieToken : headerToken;

    if (!token) {
      throw new Error("The access token is missing");
    }

    const { userId, issuedAt } = await verifyAccessToken(token);

    const user = await UserService.getUserById(toUserId(userId));

    if (!user) {
      throw new Error("The user does not exist, please try again");
    }

    if (user.passwordChangedAt) {
      // iat del JWT tiene precisión de segundos; comparar en segundos evita invalidar
      // tokens emitidos en el mismo segundo en que se cambió la contraseña
      const passwordChangedAtSeconds = Math.floor(user.passwordChangedAt.getTime() / 1000);
      if (issuedAt < passwordChangedAtSeconds) {
        throw new Error("The session is no longer valid, please log in again");
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
  } catch (err) {
    console.error(err);
    error(res, toErrorMessage(err), 401);
  }
}
