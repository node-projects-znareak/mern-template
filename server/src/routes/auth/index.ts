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

// Límite por CUENTA (email normalizado) en login: complementa al límite por IP
// contra credential stuffing distribuido. Solo cuentan los intentos FALLIDOS,
// así un usuario legítimo no se bloquea por hacer logins exitosos seguidos.
const loginAccountLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  keyGenerator: (req) => {
    const email = (req.body as { email?: unknown }).email;
    return typeof email === "string" ? email.trim().toLowerCase() : "unknown";
  },
  skip: (req) => typeof (req.body as { email?: unknown }).email !== "string",
});

router.post(
  "/login",
  authRateLimiter,
  loginAccountLimiter,
  validate(loginSchemaValidation),
  authController.login,
);
router.post("/signup", authRateLimiter, validate(signupSchemaValidation), authController.signup);
router.post("/refresh", authController.refresh);
router.post("/logout", authController.logout);
router.get(
  "/check-email",
  validate(checkEmailSchemaValidation),
  authController.checkEmailAvailability,
);

export default router;
