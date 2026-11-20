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
    // Acotada: el limiter corre antes de validar y el body puede pesar hasta 100kb.
    return typeof email === "string" ? email.trim().toLowerCase().slice(0, 100) : "unknown";
  },
  skip: (req) => typeof (req.body as { email?: unknown }).email !== "string",
});

// refresh y logout son frecuentes en uso normal (el refresh corre cada ~15 min
// por sesión): bucket separado y más holgado para no competir con el
// anti-brute force de login/signup/check-email.
const sessionRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
});

router.post(
  "/login",
  authRateLimiter,
  loginAccountLimiter,
  validate(loginSchemaValidation),
  authController.login,
);
router.post("/signup", authRateLimiter, validate(signupSchemaValidation), authController.signup);
router.post("/refresh", sessionRateLimiter, authController.refresh);
router.post("/logout", sessionRateLimiter, authController.logout);
router.get(
  "/check-email",
  authRateLimiter,
  validate(checkEmailSchemaValidation),
  authController.checkEmailAvailability,
);

export default router;
