/**
 * Nominal type para modelar identificadores de dominio.
 * Evita mezclar un UserId con cualquier otro string por accidente.
 */
export type Brand<T, B extends string> = T & { readonly __brand: B };

export type UserId = Brand<string, "UserId">;
