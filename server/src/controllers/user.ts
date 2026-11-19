import { error, success } from "@helpers/httpResponses";
import UserService from "@services/user";
import type { NextFunction, Request, Response } from "express";

import type { ChangePasswordInput } from "../types/auth";

class UserController {
  async changePassword(this: void, req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { password } = req.body as ChangePasswordInput;

      const session = req.session;

      if (!session) {
        error(res, "No active session", 401);
        return;
      }

      const userUpdated = await UserService.changePassword({ id: session.userId, password });

      if (!userUpdated) {
        error(res, "The user does not exist", 404);
        return;
      }

      success(res, userUpdated);
    } catch (err) {
      next(err);
    }
  }

  getUserSession(this: void, req: Request, res: Response): void {
    const user = req.session?.user;

    if (!user) {
      error(res, "No active session", 401);
      return;
    }

    success(res, user);
  }
}

export default new UserController();
