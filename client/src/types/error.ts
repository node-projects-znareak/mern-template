export type AxiosErrorResponse = {
  response?: {
    data?:
      | {
          data?: string;
          message?: string;
          errors?: { message?: string }[];
        }
      | string;
  };
};

export type ErrorWithData = {
  data?: string;
};

export type ErrorWithMessage = {
  message?: string;
};
