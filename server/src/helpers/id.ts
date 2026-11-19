import { Types } from "mongoose";

import type { UserId } from "../types/brand";

export function toUserId(id: string | Types.ObjectId): UserId {
  if (typeof id === "string" && !Types.ObjectId.isValid(id)) {
    throw new Error(`Invalid UserId: ${id}`);
  }
  return String(id) as UserId;
}
