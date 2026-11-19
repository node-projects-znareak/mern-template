import { COOKIE_DOMAIN, IS_PRODUCTION } from "@config/variables";
import type { Response } from "express";

export const ACCESS_TOKEN_COOKIE = "access_token";
export const REFRESH_TOKEN_COOKIE = "refresh_token";
// Bandera NO httpOnly (sin secretos): permite al frontend saber si hay sesión
// sin llamar a la API. Siempre se emite/limpia junto a los tokens.
export const SESSION_FLAG_COOKIE = "session_present";

const ACCESS_TOKEN_MAX_AGE_MS = 15 * 60 * 1000;
const REFRESH_TOKEN_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

// Con COOKIE_DOMAIN (p. ej. ".example.com") las cookies se comparten entre
// subdominios del mismo sitio (app.example.com ↔ api.example.com).
const DOMAIN_OPTIONS = COOKIE_DOMAIN.length > 0 ? { domain: COOKIE_DOMAIN } : {};

export function setAuthCookies(res: Response, accessToken: string, refreshToken: string): void {
  const base = {
    httpOnly: true,
    sameSite: "lax",
    secure: IS_PRODUCTION,
    ...DOMAIN_OPTIONS,
  } as const;

  res.cookie(ACCESS_TOKEN_COOKIE, accessToken, {
    ...base,
    maxAge: ACCESS_TOKEN_MAX_AGE_MS,
    path: "/",
  });
  res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
    ...base,
    maxAge: REFRESH_TOKEN_MAX_AGE_MS,
    path: "/api/auth",
  });
  res.cookie(SESSION_FLAG_COOKIE, "1", {
    httpOnly: false,
    sameSite: "lax",
    secure: IS_PRODUCTION,
    ...DOMAIN_OPTIONS,
    maxAge: REFRESH_TOKEN_MAX_AGE_MS,
    path: "/",
  });
}

export function clearAuthCookies(res: Response): void {
  res.clearCookie(ACCESS_TOKEN_COOKIE, { path: "/", ...DOMAIN_OPTIONS });
  res.clearCookie(REFRESH_TOKEN_COOKIE, { path: "/api/auth", ...DOMAIN_OPTIONS });
  res.clearCookie(SESSION_FLAG_COOKIE, { path: "/", ...DOMAIN_OPTIONS });
}
