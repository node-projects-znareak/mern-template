import { error } from "@helpers/httpResponses";
import { getInfoFromUserJwt, toErrorMessage } from "@helpers/index";
import UserService from "@services/user";
import type { NextFunction, Request, Response } from "express";

import { toUserId } from "../helpers/id";

export default async function requiredUserAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const header = req.get("authorization");

    if (!header) {
      throw new Error("The authorization header is missing");
    }

    const token = header.split(" ")[1];

    if (!token) {
      throw new Error("The authorization token is missing");
    }

    const $user = await getInfoFromUserJwt(token);

    const user = await UserService.getUserById(toUserId($user._id));

    if (!user) {
      throw new Error("The user does not exist, please try again");
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
