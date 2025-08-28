import axios from "axios";
import { ErrorFormat, ResponseData, ResponseFormat } from "@interfaces/axios";
import type { User } from "@interfaces/auth";
import type { EmailCheckResponse } from "@interfaces/email";
import { getToken, removeToken } from "@/utils/token";
import { AxiosErrorResponse, ErrorWithData, ErrorWithMessage } from "@interfaces/error";

export const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json; charset=utf-8",
  },
});

instance.interceptors.response.use(
  (res: ResponseFormat) => res,
  (err: ErrorFormat) => {
    const status = err.response?.data?.statusCode ?? err.response?.status;
    if (status === 401) {
      removeToken();
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

instance.interceptors.request.use((config) => {
  const token = getToken();
  config.headers.authorization = token && `Bearer ${token}`;
  return config;
});

export const getSession = async () => {
  const { data: response } = await instance.get<ResponseData<User>>("/user");
  return response.data;
};

export const loginUser = async (credentials: { email: string; password: string }) => {
  const { data: response } = await instance.post<ResponseData<{ user: User; token: string }>>(
    "/auth/login",
    credentials
  );
  return response.data;
};

export const signupUser = async (credentials: {
  email: string;
  password: string;
  passwordConfirm: string;
  name: string;
}) => {
  const { data: response } = await instance.post<ResponseData<{ user: User; token: string }>>(
    "/auth/signup",
    credentials
  );
  return response.data;
};

export const checkEmailAvailability = async (email: string) => {
  const { data: response } = await instance.get<ResponseData<EmailCheckResponse>>(`/auth/check-email?email=${encodeURIComponent(email)}`);
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
