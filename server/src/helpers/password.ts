import { JWT_SALT_TOKEN } from "@config/variables";
import bcrypt from "bcryptjs";

export function isInvalidPassword(hashedPassword: string, password: string): boolean {
  const result = bcrypt.compareSync(hashedPassword, password);
  return !result;
}

export function encryptPayload(payload: string, saltRounds: number = JWT_SALT_TOKEN): string {
  const salt = bcrypt.genSaltSync(saltRounds);
  return bcrypt.hashSync(payload, salt);
}

export function hashPassword(password: string): string {
  return encryptPayload(password);
}
