import { hashPassword } from "@helpers/password";
import { type PublicUser, type User, UserModel } from "@models/user";

import type { UserId } from "../types/brand";
import TokenService from "./token";

export interface CreateUserInput {
  readonly name: string;
  readonly email: string;
  readonly password: string;
}

export interface ChangePasswordInput {
  readonly id: UserId;
  readonly password: string;
}

const OPTIONS_UPDATE = { new: true } as const;

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function toPublicUser(user: User): PublicUser {
  const { password: _password, ...publicUser } = user;
  void _password;
  return publicUser;
}

class UserService {
  async createUser(payload: CreateUserInput): Promise<PublicUser> {
    const user = new UserModel({ ...payload, email: normalizeEmail(payload.email) });
    const result = await user.save();
    return toPublicUser(result.toObject());
  }

  existsUser(email: string): Promise<User | null> {
    return UserModel.findOne({ email: normalizeEmail(email) }).lean();
  }

  async isEmailInUse(email: string): Promise<boolean> {
    const count = await UserModel.countDocuments({ email: normalizeEmail(email) });
    return count > 0;
  }

  async getUserById(id: UserId): Promise<PublicUser | null> {
    return await UserModel.findById(id, { password: 0 }).lean();
  }

  async changePassword({ id, password }: ChangePasswordInput): Promise<PublicUser | null> {
    const userUpdated = await UserModel.findByIdAndUpdate(
      id,
      {
        password: await hashPassword(password),
        passwordChangedAt: new Date(),
      },
      OPTIONS_UPDATE,
    ).lean();

    // El cambio de contraseña invalida todas las sesiones: se revocan los refresh tokens
    await TokenService.revokeAllForUser(id);

    return userUpdated ? toPublicUser(userUpdated) : null;
  }
}

export default new UserService();
