import { clearAuthCookies } from "@helpers/cookies";
import { error, success } from "@helpers/httpResponses";
import { isLoginPasswordInvalid } from "@helpers/index";
import UserService from "@services/user";
import type { NextFunction, Request, Response } from "express";

import type { ChangePasswordInput } from "../types/auth";

class UserController {
  async changePassword(this: void, req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { currentPassword, password } = req.body as ChangePasswordInput;

      const session = req.session;

      if (!session) {
        error(res, "No active session", 401);
        return;
      }

      // Verificar la contraseña actual: sin esto, un access token robado
      // permitiría cambiar la contraseña y secuestrar la cuenta.
      const storedUser = await UserService.existsUser(session.user.email);

      if (await isLoginPasswordInvalid(storedUser?.password ?? null, currentPassword)) {
        error(res, "Current password is incorrect", 401);
        return;
      }

      const userUpdated = await UserService.changePassword({ id: session.userId, password });

      if (!userUpdated) {
        error(res, "The user does not exist", 404);
        return;
      }

      // El servicio ya revocó TODAS las sesiones del usuario (sus refresh
      // tokens) al cambiar la contraseña; aquí solo se limpian las cookies
      // del navegador actual.
      clearAuthCookies(res);

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
