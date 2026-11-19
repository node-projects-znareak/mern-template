import { DUMMY_PASSWORD, JWT_SALT_TOKEN } from "@config/variables";
import bcrypt from "bcryptjs";

let dummyPasswordHashPromise: Promise<string> | null = null;

/**
 * Devuelve un hash dummy cacheado para igualar los tiempos del login cuando el usuario no existe,
 * evitando la enumeración de emails por timing. Se cachea la promesa (no el resultado) para
 * compartir el cálculo entre peticiones concurrentes.
 */
function getDummyPasswordHash(): Promise<string> {
  dummyPasswordHashPromise ??= hashPassword(DUMMY_PASSWORD);
  return dummyPasswordHashPromise;
}

export async function hashPassword(
  password: string,
  saltRounds: number = JWT_SALT_TOKEN,
): Promise<string> {
  const salt = await bcrypt.genSalt(saltRounds);
  return bcrypt.hash(password, salt);
}

/**
 * Verifica la contraseña de login. Si no hay hash almacenado (usuario inexistente)
 * compara contra un hash dummy para igualar tiempos y evitar enumeración de usuarios.
 */
export async function isLoginPasswordInvalid(
  storedHash: string | null,
  password: string,
): Promise<boolean> {
  const hash = storedHash ?? (await getDummyPasswordHash());
  const result = await bcrypt.compare(password, hash);
  return !result;
}
