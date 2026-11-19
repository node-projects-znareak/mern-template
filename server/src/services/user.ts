import { hashPassword } from "@helpers/password";
import { type PublicUser, type User, UserModel } from "@models/user";

import type { UserId } from "../types/brand";

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

function toPublicUser(user: User): PublicUser {
  const { password: _password, ...publicUser } = user;
  void _password;
  return publicUser;
}

class UserService {
  async createUser(payload: CreateUserInput): Promise<PublicUser> {
    const user = new UserModel(payload);
    const result = await user.save();
    return toPublicUser(result.toObject());
  }

  existsUser(email: string): Promise<User | null> {
    return UserModel.findOne({ email }).lean();
  }

  async isEmailInUse(email: string): Promise<boolean> {
    const count = await UserModel.countDocuments({ email });
    return count > 0;
  }

  async getUserById(id: UserId): Promise<PublicUser | null> {
    return await UserModel.findById(id, { password: 0 }).lean();
  }

  async changePassword({ id, password }: ChangePasswordInput): Promise<PublicUser | null> {
    const userUpdated = await UserModel.findByIdAndUpdate(
      id,
      { password: hashPassword(password) },
      OPTIONS_UPDATE,
    ).lean();
    return userUpdated ? toPublicUser(userUpdated) : null;
  }
}

export default new UserService();
