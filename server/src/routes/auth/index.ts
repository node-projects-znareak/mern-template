import { AUTH_RATE_LIMITS } from "@config/variables";
import authController from "@controllers/auth";
import validate from "@helpers/validate";
import {
  checkEmailSchemaValidation,
  loginSchemaValidation,
  signupSchemaValidation,
} from "@schemas/auth";
import express from "express";
import rateLimit from "express-rate-limit";

const router = express.Router();

const authRateLimiter = rateLimit(AUTH_RATE_LIMITS);

router.post("/login", authRateLimiter, validate(loginSchemaValidation), authController.login);
router.post("/signup", authRateLimiter, validate(signupSchemaValidation), authController.signup);
router.get(
  "/check-email",
  validate(checkEmailSchemaValidation),
  authController.checkEmailAvailability,
);

export default router;
