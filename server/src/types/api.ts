export interface ApiSuccessPayload<T> {
  readonly ok: true;
  readonly error: false;
  readonly data: T;
  readonly statusCode: number;
}

export interface ApiErrorPayload<T> {
  readonly ok: false;
  readonly error: string | boolean;
  readonly data: T;
  readonly statusCode: number;
}

export type ApiResponse<T> = ApiSuccessPayload<T> | ApiErrorPayload<T>;
