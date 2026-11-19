// Al ejecutar el JS compilado (dist), los alias se resuelven con module-alias.
// En desarrollo, tsx resuelve los alias directamente desde tsconfig.json.
if (__filename.endsWith(".js")) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports -- registro de alias solo en el JS compilado
  require("module-alias/register");
}

import { readFileSync } from "node:fs";
import path from "node:path";

import startServer from "@config/server";
import { API, HOST } from "@config/variables";
import { setupGlobalLogging } from "@helpers/logger";
import {
  COMPRESSION_MIDDLEWARE,
  CORS_MIDDLEWARE,
  PARSING_MIDDLEWARES,
  SECURITY_MIDDLEWARES,
} from "@middlewares/utils";
import routes from "@routes/index";
import express from "express";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";

interface SwaggerDocument {
  servers?: { url: string; description: string }[];
  [key: string]: unknown;
}

const app = express();

let swaggerDocument: SwaggerDocument | null = null;

if (API.ENVIROMENT === "development") {
  app.use(morgan("dev"));

  swaggerDocument = JSON.parse(
    readFileSync(path.join(__dirname, "swagger.json"), "utf8"),
  ) as SwaggerDocument;

  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}

app.set("trust proxy", API.ENVIROMENT === "production" ? 1 : 0);

app.use(COMPRESSION_MIDDLEWARE);
app.use(express.static("./uploads", { dotfiles: "deny", index: false, maxAge: "1d" }));
app.use(...PARSING_MIDDLEWARES);
app.use(...SECURITY_MIDDLEWARES);
app.use(CORS_MIDDLEWARE);

app.disable("x-powered-by");

setupGlobalLogging();

void startServer(app, routes).then((activePort) => {
  if (swaggerDocument !== null) {
    swaggerDocument.servers = [
      {
        url: `http://${HOST ?? "localhost"}:${activePort}`,
        description: "Servidor de desarrollo",
      },
    ];
  }
});
