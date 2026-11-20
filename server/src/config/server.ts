import { readFileSync } from "node:fs";
import type { Server } from "node:http";
import {
  createServer as createHttpsServer,
  type ServerOptions as HttpsServerOptions,
} from "node:https";

import { closeDb, connectDb, getDatabaseHealth } from "@config/connection";
import { API, HOST, HTTPS_CERT_PATH, HTTPS_KEY_PATH, PORT } from "@config/variables";
import { listAppEndpoints } from "@helpers/endpoints";
import { getLocalIP, message, table } from "@helpers/index";
import wrapServerErrors from "@middlewares/errorsHandling";
import { consola } from "consola";
import type { Express, Router } from "express";

const PORT_NOT_USABLE_CODES = ["EADDRINUSE", "EACCES", "EADDRNOTAVAIL"] as const;
const MAX_PORT_ATTEMPTS = 10;

interface ListenResult {
  readonly server: Server;
  readonly port: number;
}

interface ListenOptions {
  readonly app: Express;
  readonly host: string | undefined;
  readonly port: number;
  readonly https: HttpsServerOptions | null;
}

/**
 * Devuelve las opciones TLS si se configuraron certificado y clave,
 * o `null` para escuchar con HTTP plano.
 */
function getHttpsOptions(): HttpsServerOptions | null {
  if (!HTTPS_CERT_PATH || !HTTPS_KEY_PATH) {
    return null;
  }

  return {
    cert: readFileSync(HTTPS_CERT_PATH),
    key: readFileSync(HTTPS_KEY_PATH),
  };
}

function getErrorCode(error: unknown): string | undefined {
  const code = (error as NodeJS.ErrnoException).code;
  return typeof code === "string" ? code : undefined;
}

/**
 * Escucha en `port` y, si el puerto no es utilizable (en uso, sin permisos, etc.),
 * prueba automáticamente con el siguiente puerto hasta encontrar uno libre.
 */
async function listenWithFallback(options: ListenOptions, attempt = 0): Promise<ListenResult> {
  const { app, host, port, https } = options;

  if (attempt >= MAX_PORT_ATTEMPTS) {
    throw new Error(`Could not find a usable port after ${MAX_PORT_ATTEMPTS} attempts`);
  }

  let server: Server;

  if (https === null) {
    server = host === undefined ? app.listen(port) : app.listen(port, host);
  } else {
    server = createHttpsServer(https, app);
    if (host === undefined) {
      server.listen(port);
    } else {
      server.listen(port, host);
    }
  }

  try {
    await new Promise<void>((resolve, reject) => {
      server.once("listening", resolve);
      server.once("error", reject);
    });
    return { server, port };
  } catch (error) {
    const code = getErrorCode(error);
    if (code !== undefined && (PORT_NOT_USABLE_CODES as readonly string[]).includes(code)) {
      message.warn(`Port ${port} not usable (${code}), trying with port ${port + 1}`);
      return listenWithFallback({ app, host, port: port + 1, https }, attempt + 1);
    }
    throw error instanceof Error ? error : new Error(String(error));
  }
}

export default async function startServer(app: Express, routers: Router): Promise<number> {
  try {
    await connectDb();

    wrapServerErrors(app);

    app.use("/api", routers);

    app.get("/health", (_req, res) => {
      const database = getDatabaseHealth();
      const healthy = database.status === "connected";
      res.status(healthy ? 200 : 503).json({
        status: healthy ? "OK" : "DEGRADED",
        database: database.status,
        uptime: process.uptime(),
      });
    });

    app.use((req, res) => {
      res.status(404).json({
        status: 404,
        message: "Route not found",
        path: req.path,
      });
    });

    const httpsOptions = getHttpsOptions();
    const { server, port: activePort } = await listenWithFallback({
      app,
      host: HOST,
      port: PORT,
      https: httpsOptions,
    });

    console.log("");

    const protocol = httpsOptions === null ? "http" : "https";
    const ip = getLocalIP();
    if (activePort !== PORT) {
      consola.info(`Port ${PORT} was not usable, the server started on port ${activePort}`);
    }
    consola.success(`Server running at ${protocol}://${HOST ?? "localhost"}:${activePort}`);
    consola.success(`Remote server at ${protocol}://${ip}:${activePort}`);
    consola.success(`Environment: ${API.ENVIROMENT ?? "Not defined"}`);

    if (API.ENVIROMENT === "development") {
      consola.warn("Development mode enabled, extras dependencies are loaded");
      consola.success(
        `You can access the documentation on ${protocol}://${HOST ?? ip ?? "localhost"}:${activePort}/api-docs`,
      );

      const rows = listAppEndpoints(app).map(
        (endpoint) =>
          [endpoint.path, endpoint.methods.join(", "), endpoint.middlewares.join(", ")] as string[],
      );
      table.push(...rows);
      console.log(`\n${table.toString()}`);
    }

    process.on("SIGINT", () => void closeDb(server));
    process.on("SIGTERM", () => void closeDb(server));

    return activePort;
  } catch (err) {
    message.error("Error Ocurred while starting the server", err);
    // Si el arranque falla (p. ej. Mongo inaccesible tras los reintentos),
    // el proceso debe morir: sin esto quedaría vivo para siempre sin escuchar.
    process.exit(1);
  }
}
