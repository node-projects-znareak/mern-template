import * as yup from "yup";

export const passwordScheme = yup
  .string()
  .min(6, "Minimum 6 characters for password")
  .max(50, "Maximum 50 characters for password")
  .required("Password is required");

export const idSchema = yup
  .string()
  .typeError("Identifier must be an ObjectId")
  .required("Identifier is required");

export const loginSchemaValidation = yup.object({
  body: yup.object({
    email: yup
      .string()
      .email("Email must be valid, example: example@domain.com")
      .required("Email is required"),
    password: yup
      .string()
      .min(6, "Minimum 6 characters for password")
      .max(200, "Maximum 200 characters for password")
      .required("Password is required"),
  }),
});

export const signupSchemaValidation = yup.object({
  body: yup.object({
    name: yup
      .string()
      .min(4, "Minimum 4 characters for name")
      .max(100, "Maximum 100 characters for name")
      .required("Name is required"),
    email: yup
      .string()
      .email("Email must be valid, example: example@domain.com")
      .required("Email is required"),
    password: yup
      .string()
      .min(6, "Minimum 6 characters for password")
      .max(200, "Maximum 200 characters for password")
      .required("Password is required"),
    passwordConfirm: passwordScheme.test(
      "passwordChangeValidation",
      "Passwords do not match",
      function (value) {
        const parent = this.parent as { password?: unknown };
        return parent.password === value;
      },
    ),
  }),
});

export const passwordChangeValidation = yup.object({
  body: yup.object({
    currentPassword: passwordScheme,
    password: passwordScheme,
    passwordConfirm: passwordScheme.test(
      "passwordChangeValidation",
      "Passwords do not match",
      function (value) {
        const parent = this.parent as { password?: unknown };
        return parent.password === value;
      },
    ),
  }),
});

export const requireIdValidation = yup.object({
  params: yup.object({
    id: idSchema,
  }),
});

export const checkEmailSchemaValidation = yup.object({
  query: yup.object({
    email: yup
      .string()
      .email("Email must be valid, example: example@domain.com")
      .required("Email is required"),
  }),
});
