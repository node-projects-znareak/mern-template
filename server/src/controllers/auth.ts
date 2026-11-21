import { clearAuthCookies, REFRESH_TOKEN_COOKIE, setAuthCookies } from "@helpers/cookies";
import { error, success } from "@helpers/httpResponses";
import { toUserId } from "@helpers/id";
import { isLoginPasswordInvalid, isMongoDuplicateKeyError } from "@helpers/index";
import { hashPassword } from "@helpers/password";
import TokenService from "@services/token";
import UserService from "@services/user";
import type { NextFunction, Request, Response } from "express";

import type { EmailAvailabilityResult, LoginInput, SignupInput } from "../types/auth";

class AuthController {
  async login(this: void, req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body as LoginInput;
      const user = await UserService.existsUser(email);

      // Compara siempre (con hash dummy si no hay usuario) para no filtrar existencia por timing
      if (await isLoginPasswordInvalid(user?.password ?? null, password)) {
        error(res, "Invalid username or password");
        return;
      }

      if (!user) {
        error(res, "Invalid username or password");
        return;
      }

      const { password: _password, ...publicUser } = user;
      void _password;
      const tokens = await TokenService.issueTokenPair(toUserId(String(user._id)));
      setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
      success(res, { user: publicUser });
    } catch (err) {
      next(err);
    }
  }

  async signup(this: void, req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password, name } = req.body as SignupInput;
      const isInUse = await UserService.isEmailInUse(email);

      if (isInUse) {
        error(res, "Email is already in use", 409);
        return;
      }

      const passwordHashed = await hashPassword(password);
      const userCreated = await UserService.createUser({
        name,
        email,
        password: passwordHashed,
      });

      const tokens = await TokenService.issueTokenPair(toUserId(String(userCreated._id)));
      setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
      success(res, { user: userCreated }, 201);
    } catch (err) {
      if (isMongoDuplicateKeyError(err)) {
        error(res, "Email is already in use", 409);
        return;
      }
      next(err);
    }
  }

  // Renovación de sesión: 
  // 1) leer el refresh de su cookie, 
  // 2) ROTARLO (uso único; null = inválido, reusado o robado → limpiar cookies y 401),
  // 3) recargar el usuario 
  // 4) re-emitir el NUEVO par en las cookies.
  async refresh(this: void, req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE] as string | undefined;

      if (!refreshToken) {
        clearAuthCookies(res);
        error(res, "No refresh token provided", 401);
        return;
      }

      const session = await TokenService.rotateRefreshToken(refreshToken);

      if (!session) {
        clearAuthCookies(res);
        error(res, "Invalid or expired refresh token", 401);
        return;
      }

      const user = await UserService.getUserById(session.userId);

      if (!user) {
        clearAuthCookies(res);
        error(res, "The user does not exist, please try again", 401);
        return;
      }

      setAuthCookies(res, session.tokens.accessToken, session.tokens.refreshToken);
      success(res, { user });
    } catch (err) {
      next(err);
    }
  }

  // Logout: revoca solo el refresh presentado (muere en BD) y limpia cookies.
  // El access no se revoca (es stateless): expira solo en ≤15 minutos.
  async logout(this: void, req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE] as string | undefined;

      if (refreshToken) {
        await TokenService.revokeRefreshToken(refreshToken);
      }

      clearAuthCookies(res);
      success(res, "Logged out");
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
