const { envSchema } = require("@helpers/env");
const env = envSchema.parse(process.env);

const {
  JWT_SECRET_TOKEN,
  ENVIROMENT,
  PORT,
  HOST,
  MONGO_DB_URI_PRODUCTION,
  MONGO_DB_URI_DEVELOPMENT,
  JWT_SALT_TOKEN,
  CORS_ALLOWED_DOMAINS,
} = env;

const IS_PRODUCTION = ENVIROMENT === "production";
const MONGO_DB_URL = IS_PRODUCTION ? MONGO_DB_URI_PRODUCTION : MONGO_DB_URI_DEVELOPMENT;

const RATE_LIMITS = {
  windowMs: 2 * 60 * 1000, // 2 minutes
  max: 500, // limit each IP to 500 requests per windowMs
};

const SERVER = {
  PORT,
  HOST,
  API: {
    MONGO_DB_URL,
    JWT_SECRET_TOKEN,
    IS_PRODUCTION,
    ENVIROMENT,
    CORS_ALLOWED_DOMAINS,
    RATE_LIMITS,
    JWT_SALT_TOKEN,
  },
};

module.exports = SERVER;
