import type { Server } from "node:http";

import { API, IS_PRODUCTION } from "@config/variables";
import { message, toError, toErrorMessage } from "@helpers/index";
import mongoose, { type ConnectOptions } from "mongoose";
import retry from "retry";

import type { DatabaseHealth, DatabaseState } from "../types/mongo";

const connection = mongoose.connection;

// Supuestos de contexto (sin métricas de tráfico disponibles):
// - Desarrollo/test: MongoDB local con baja concurrencia → pool pequeño y sin conexiones precalentadas.
// - Producción: servidor tradicional de larga duración contra un cluster remoto (Atlas).
//   Si se despliega en serverless (Lambda), reducir: maxPoolSize 3-5, minPoolSize 0, maxIdleTimeMS 10-30s.
const LOCAL_MONGO_OPTIONS: ConnectOptions = {
  ignoreUndefined: true,
  maxPoolSize: 10, // baja concurrencia local; suficiente con margen
  minPoolSize: 0, // no mantener conexiones ociosas en desarrollo
  maxIdleTimeMS: 30_000, // libera rápido las conexiones sin uso en local
  connectTimeoutMS: 5_000, // falla rápido si el MongoDB local no responde
  socketTimeoutMS: 30_000, // operaciones OLTP cortas no deben colgarse más de 30s
  serverSelectionTimeoutMS: 5_000, // reintento ágil de selección de servidor
};

const PRODUCTION_MONGO_OPTIONS: ConnectOptions = {
  ignoreUndefined: true,
  maxPoolSize: 20, // arranque conservador (10-20) sin datos de tráfico; monitorizar y ajustar
  minPoolSize: 5, // conexiones precalentadas listas para picos de tráfico
  maxIdleTimeMS: 300_000, // 5 min: balance entre reutilización y limpieza de ociosas
  connectTimeoutMS: 10_000, // mayor latencia de red hacia el cluster remoto
  socketTimeoutMS: 30_000, // evita consultas colgadas; adecuado para OLTP corto
  serverSelectionTimeoutMS: 5_000, // failover rápido ante cambios en la topología del replica set
  compressors: ["zlib"], // compresión de red para latencias altas (>50ms) hacia Atlas
};

const READY_STATES = ["disconnected", "connected", "connecting", "disconnecting"] as const;

export function getDatabaseState(): DatabaseState {
  return READY_STATES[mongoose.connection.readyState as number] ?? "disconnected";
}

export function getDatabaseHealth(): DatabaseHealth {
  return { status: getDatabaseState() };
}

connection.on("open", () => {
  message.success(`Connected to mongo host: ${connection.host}`);
  message.success(`Connected on port: ${connection.port}`);
  message.success(`Database name: ${connection.name}`);
});

connection.on("error", (err) => {
  message.error("Error connecting to MongoDB", err);
});

export async function closeDb(server: Server): Promise<void> {
  // Si el apagado se queda colgado (p. ej. Mongo inaccesible al desconectar),
  // este timer fuerza la salida para que el proceso no quede vivo para siempre.
  const forceExit = setTimeout(() => {
    message.error("Forced shutdown: disconnect timed out");
    process.exit(1);
  }, 10_000);
  forceExit.unref();

  try {
    await mongoose.disconnect();
    message.success("MongoDB disconnected successfully");
    server.close();
    message.success("The server has stopped successfully");
  } catch (err) {
    message.error("Error disconnecting from MongoDB", err);
  } finally {
    clearTimeout(forceExit);
  }
}

export function connectDb(): Promise<typeof mongoose> {
  return new Promise((resolve, reject) => {
    const operation = retry.operation({
      retries: 3,
      factor: 2,
      minTimeout: 1000,
      maxTimeout: 5000,
      randomize: true,
    });

    // eslint-disable-next-line @typescript-eslint/no-misused-promises -- la API de retry no admite callbacks async
    operation.attempt(async (currentAttempt) => {
      try {
        console.log("");
        message.success(`Connecting to MongoDB... (Attempt ${currentAttempt})`);
        const options = IS_PRODUCTION ? PRODUCTION_MONGO_OPTIONS : LOCAL_MONGO_OPTIONS;
        const con = await mongoose.connect(API.MONGO_DB_URL, options);
        resolve(con);
      } catch (err) {
        if (operation.retry(toError(err))) {
          message.error(
            `Connection attempt ${currentAttempt} failed, retrying...`,
            toErrorMessage(err),
          );
          return;
        }

        const finalError = operation.mainError() ?? toError(err);
        message.error("Failed to connect to MongoDB after all retries", finalError);
        reject(finalError);
      }
    });
  });
}
