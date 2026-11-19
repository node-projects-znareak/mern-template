import { error, success } from "@helpers/httpResponses";
import { createUserJwt, hashPassword, isInvalidPassword, toUserJwtPayload } from "@helpers/index";
import UserService from "@services/user";
import type { NextFunction, Request, Response } from "express";

import type { EmailAvailabilityResult, LoginInput, SignupInput } from "../types/auth";

class AuthController {
  async login(this: void, req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body as LoginInput;
      const user = await UserService.existsUser(email);

      if (!user) {
        error(res, "Invalid username or password");
        return;
      }

      if (isInvalidPassword(password, user.password)) {
        error(res, "Invalid username or password");
        return;
      }

      const { password: _password, ...publicUser } = user;
      void _password;
      const token = createUserJwt(toUserJwtPayload(publicUser));
      success(res, { user: publicUser, token });
    } catch (err) {
      next(err);
    }
  }

  async signup(this: void, req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password, name } = req.body as SignupInput;
      const isInUse = await UserService.isEmailInUse(email);

      if (isInUse) {
        error(res, "Email is already in use");
        return;
      }

      const passwordHashed = hashPassword(password);
      const userCreated = await UserService.createUser({
        name,
        email,
        password: passwordHashed,
      });

      const token = createUserJwt(toUserJwtPayload(userCreated));
      success(res, { user: userCreated, token }, 201);
    } catch (err) {
      next(err);
    }
  }

  async checkEmailAvailability(
    this: void,
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { email } = req.query as { email: string };
      const isInUse = await UserService.isEmailInUse(email);
      const result: EmailAvailabilityResult = {
        email,
        available: !isInUse,
        inUse: isInUse,
      };

      success(res, result);
    } catch (err) {
      next(err);
    }
  }
}

export default new AuthController();
