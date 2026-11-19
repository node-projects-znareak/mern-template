export function toError(value: unknown): Error {
  return value instanceof Error ? value : new Error(String(value));
}

export function toErrorMessage(value: unknown): string {
  return value instanceof Error ? value.message : String(value);
}
