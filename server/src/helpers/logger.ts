import pino from "pino";
import pretty from "pino-pretty";

import { toErrorMessage } from "./errors";

export const logger = pino(
  pretty({
    colorize: true,
    sync: true,
  }),
);

export const message = {
  success(text: string): void {
    logger.info(text);
  },

  error(text: string, err: unknown = null): void {
    logger.error(text);
    if (err !== null) {
      logger.error(`Error message: ${toErrorMessage(err)}`);
    }
  },

  warn(text: unknown): void {
    logger.warn(String(text));
  },
} as const;

export function setupGlobalLogging(): void {
  process.on("uncaughtException", (error) => {
    logger.fatal({ err: error }, "Uncaught exception");
    process.exit(1);
  });

  process.on("unhandledRejection", (reason) => {
    logger.error(
      { err: reason instanceof Error ? reason : new Error(String(reason)) },
      "Unhandled promise rejection",
    );
  });

  process.on("warning", (warning) => {
    logger.warn({ err: warning }, `System warning: ${warning.name}: ${warning.message}`);
  });
}
