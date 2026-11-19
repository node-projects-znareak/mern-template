import type { Server } from "node:http";

import { closeDb, connectDb, getDatabaseHealth } from "@config/connection";
import { API, HOST, PORT } from "@config/variables";
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
  const { app, host, port } = options;

  if (attempt >= MAX_PORT_ATTEMPTS) {
    throw new Error(`Could not find a usable port after ${MAX_PORT_ATTEMPTS} attempts`);
  }

  const server: Server = host === undefined ? app.listen(port) : app.listen(port, host);

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
      return listenWithFallback({ app, host, port: port + 1 }, attempt + 1);
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

    const { server, port: activePort } = await listenWithFallback({ app, host: HOST, port: PORT });

    console.log("");

    const ip = getLocalIP();
    if (activePort !== PORT) {
      consola.info(`Port ${PORT} was not usable, the server started on port ${activePort}`);
    }
    consola.success(`Server running at http://${HOST ?? "localhost"}:${activePort}`);
    consola.success(`Remote server at http://${ip}:${activePort}`);
    consola.success(`Environment: ${API.ENVIROMENT ?? "Not defined"}`);

    if (API.ENVIROMENT === "development") {
      consola.warn("Development mode enabled, extras dependencies are loaded");
      consola.success(
        `You can access the documentation on http://${HOST ?? ip ?? "localhost"}:${activePort}/api-docs`,
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
    return PORT;
  }
}
