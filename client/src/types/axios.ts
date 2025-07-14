import type { AxiosError, AxiosResponse } from "axios";

export interface ResponseData<T = unknown> {
  ok: boolean;
  error: boolean;
  data: T;
  statusCode: number;
}

export interface FormatError
  extends AxiosError<{
    message: string;
    err: string;
    data:
      | string
      | {
          message: string;
          err: string;
        };
  }> {
  message: string;
}

export type ResponseFormat = AxiosResponse<ResponseData>

export type ErrorFormat = AxiosError<ResponseData>;
