require("module-alias/register");

const compression = require("compression");
const express = require("express");
const contentSecurityPolicy = require("helmet-csp");
const helmet = require("helmet");
const hpp = require("hpp");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const app = express();
const routes = require("@routes/index");
const startServer = require("@config/server");
const { logger } = require("@helpers/index");
const { API, HOST, PORT } = require("@config/variables");

if (API.ENVIROMENT === "development") {
  app.use(require("morgan")("dev"));

  const swaggerUi = require("swagger-ui-express");
  const fs = require("fs");
  const path = require("path");

  const swaggerDocument = JSON.parse(fs.readFileSync(path.join(__dirname, "swagger.json"), "utf8"));
  swaggerDocument.servers = [
    {
      url: `${HOST ? "htpps" : "http"}://${HOST || "localhost"}:${PORT}`,
      description: "Servidor de desarrollo",
    },
  ];

  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}

if (API.ENVIROMENT === "production") {
  app.set("trust proxy", 1);
} else {
  app.set("trust proxy", 0);
}

app.use(compression());
app.use(express.static("./uploads"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(helmet());
app.use(
  contentSecurityPolicy({
    useDefaults: true,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
    reportOnly: false,
  })
);
app.use(hpp());
app.use(rateLimit(API.RATE_LIMITS));
app.use(
  mongoSanitize({
    onSanitize: ({ key }) => {
      console.warn(`This request[${key}] is sanitized`);
    },
  })
);

app.use(
  cors({
    origin: API.CORS_ALLOWED_DOMAINS,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Authorization", "Content-Type"],
  })
);

app.disable("x-powered-by");

startServer(app, routes);

process.on("uncaughtException", (err) => {
  logger.error(err);
});

process.on("unhandledRejection", (err) => {
  logger.error(err);
});

process.on("warning", (e) => logger.warn(e));
