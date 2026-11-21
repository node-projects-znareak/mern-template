import { mongo } from "mongoose";

export function isMongoDuplicateKeyError(value: unknown): boolean {
  return value instanceof mongo.MongoServerError && value.code === 11000;
}

// Devuelve el NOMBRE del campo que provocó el duplicado (p. ej. "email" o
// "name"), o null si el error no es de clave duplicada. Un 11000 puede venir
// de CUALQUIER índice único: con esto damos el mensaje correcto en cada caso.
export function getDuplicateKeyField(value: unknown): string | null {
  if (!isMongoDuplicateKeyError(value)) {
    return null;
  }
  const keyValue = (value as { keyValue?: Record<string, unknown> }).keyValue;
  const field = keyValue ? Object.keys(keyValue)[0] : undefined;
  return typeof field === "string" ? field : null;
}
