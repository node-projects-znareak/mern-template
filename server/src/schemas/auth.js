const yup = require("yup");
const passwordScheme = yup
  .string()
  .min(6, "Minimum 6 characters for password")
  .max(50, "Maximum 50 characters for password")
  .required("Password is required");

const idSchema = yup
  .string()
  .typeError("Identifier must be an ObjectId")
  .required("Identifier is required");

const loginSchemaValidation = yup.object({
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

const signupSchemaValidation = yup.object({
  body: yup.object({
    username: yup
      .string()
      .min(4, "Minimum 4 characters for username")
      .max(100, "Maximum 100 characters for username")
      .required("Username is required"),
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
        return this.parent.password === value;
      }
    ),
  }),
});

const passwordChangeValidation = yup.object({
  body: yup.object({
    password: passwordScheme,
    passwordConfirm: passwordScheme.test(
      "passwordChangeValidation",
      "Passwords do not match",
      function (value) {
        return this.parent.password === value;
      }
    ),
  }),
});

const requireIdValidation = yup.object({
  params: yup.object({
    id: idSchema,
  }),
});

const checkEmailSchemaValidation = yup.object({
  query: yup.object({
    email: yup
      .string()
      .email("Email must be valid, example: example@domain.com")
      .required("Email is required"),
  }),
});

const checkUsernameSchemaValidation = yup.object({
  query: yup.object({
    username: yup
      .string()
      .min(4, "Minimum 4 characters for username")
      .max(100, "Maximum 100 characters for username")
      .required("Username is required"),
  }),
});

module.exports = {
  loginSchemaValidation,
  signupSchemaValidation,
  passwordChangeValidation,
  requireIdValidation,
  checkEmailSchemaValidation,
  checkUsernameSchemaValidation,
};
