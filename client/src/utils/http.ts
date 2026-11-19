import axios, { type AxiosError } from "axios";
import { queryClient } from "@/lib/queryClient";
import { router } from "@/router";
import { ResponseData, ResponseFormat } from "@interfaces/axios";
import type { User } from "@interfaces/auth";
import type { EmailCheckResponse } from "@interfaces/email";
import { AxiosErrorResponse, ErrorWithData, ErrorWithMessage } from "@interfaces/error";

export const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:5000/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json; charset=utf-8",
  },
});

const AUTH_PATHS = ["/auth/login", "/auth/signup", "/auth/refresh", "/auth/logout"] as const;
const retriedUrls = new Set<string>();
let refreshPromise: Promise<unknown> | null = null;

const REFRESH_LOCK_NAME = "mern-template:session-refresh";

// Serializa el refresh entre pestañas (Web Locks): evita que dos pestañas
// refresquen a la vez con el mismo refresh_token, lo que dispararía la
// detección de reuso y borraría la sesión.
async function refreshSession(): Promise<void> {
  if (typeof navigator !== "undefined" && "locks" in navigator) {
    await navigator.locks.request(REFRESH_LOCK_NAME, () => instance.post("/auth/refresh"));
    return;
  }

  await instance.post("/auth/refresh");
}

// Cookie bandera NO httpOnly (sin secretos) que el servidor emite y limpia junto
// a los tokens. Es la única forma de saber si hay sesión desde JS sin llamar a
// la API, porque access_token y refresh_token son httpOnly e invisibles para JS.
export const SESSION_FLAG_COOKIE = "session_present";

export function hasSessionCookie(): boolean {
  return document.cookie.split("; ").some((entry) => entry.startsWith(`${SESSION_FLAG_COOKIE}=`));
}

instance.interceptors.response.use(
  (res: ResponseFormat) => res,
  async (err: AxiosError<ResponseData>) => {
    const original = err.config;
    const status = err.response?.data?.statusCode ?? err.response?.status;
    const url = original?.url ?? "";
    const isAuthRequest = AUTH_PATHS.some((path) => url.startsWith(path));

    if (status === 401 && original && !isAuthRequest && !retriedUrls.has(url) && hasSessionCookie()) {
      retriedUrls.add(url);

      try {
        refreshPromise ??= refreshSession().finally(() => {
          refreshPromise = null;
        });
        await refreshPromise;
      } catch {
        // El refresh falló: la sesión ya no es renovable.
        retriedUrls.delete(url);
        const onAuthPage = ["/login", "/register"].some((path) => window.location.pathname.startsWith(path));

        // En páginas de auth no se limpia la caché: el SessionProvider refetchearía
        // /user al instante y volvería a fallar el refresh, creando un bucle infinito.
        if (!onAuthPage) {
          queryClient.clear();
          void router.navigate("/login", { replace: true });
        }

        return Promise.reject(err);
      }

      try {
        // Reintenta la petición original con las cookies renovadas.
        // Mientras tanto la URL sigue en el set para evitar bucles de refresh.
        return await instance(original);
      } finally {
        retriedUrls.delete(url);
      }
    }

    return Promise.reject(err);
  }
);

export const getSession = async (): Promise<User | null> => {
  // Sin bandera de sesión no hay cookies de auth: no se consulta /user.
  if (!hasSessionCookie()) {
    return null;
  }

  try {
    const { data: response } = await instance.get<ResponseData<User>>("/user");
    return response.data;
  } catch (error) {
    if (axios.isAxiosError<ResponseData>(error)) {
      const status = error.response?.data?.statusCode ?? error.response?.status;
      if (status === 401) {
        return null;
      }
    }

    throw error;
  }
};

export const loginUser = async (credentials: { email: string; password: string }) => {
  const { data: response } = await instance.post<ResponseData<{ user: User }>>("/auth/login", credentials);
  return response.data;
};

export const signupUser = async (credentials: {
  email: string;
  password: string;
  passwordConfirm: string;
  name: string;
}) => {
  const { data: response } = await instance.post<ResponseData<{ user: User }>>("/auth/signup", credentials);
  return response.data;
};

export const logoutUser = async () => {
  await instance.post("/auth/logout");
};

export const checkEmailAvailability = async (email: string) => {
  const { data: response } = await instance.get<ResponseData<EmailCheckResponse>>(
    `/auth/check-email?email=${encodeURIComponent(email)}`
  );
  return response.data;
};

export const formatError = (error: unknown): string => {
  if (typeof error === "string") {
    return error;
  }

  if (error && typeof error === "object" && "message" in error) {
    return String(error.message);
  }

  return "Ha ocurrido un error inesperado";
};

export function parseError(error: unknown): string {
  if (typeof error === "string") return error;

  if (typeof error === "object" && error !== null && "response" in error) {
    const axiosErr = error as AxiosErrorResponse;
    const data = axiosErr.response?.data;

    if (typeof data === "string") return data;

    if (typeof data === "object" && data !== null) {
      if (typeof data.data === "string") return data.data;
      if (typeof data.message === "string") return data.message;

      if (Array.isArray(data.errors)) {
        const messages = data.errors
          .map((e) => (typeof e === "object" && e !== null && typeof e.message === "string" ? e.message : String(e)))
          .filter(Boolean);

        if (messages.length > 0) {
          return messages.join(". ");
        }
      }
    }
  }

  if (error instanceof Error && typeof error.message === "string") {
    return error.message;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "data" in error &&
    typeof (error as ErrorWithData).data === "string"
  ) {
    return (error as ErrorWithData).data!;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as ErrorWithMessage).message === "string"
  ) {
    return (error as ErrorWithMessage).message!;
  }

  return "An unexpected error occurred";
}
