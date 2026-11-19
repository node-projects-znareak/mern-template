import { mongo } from "mongoose";

export function isMongoDuplicateKeyError(value: unknown): boolean {
  return value instanceof mongo.MongoServerError && value.code === 11000;
}
