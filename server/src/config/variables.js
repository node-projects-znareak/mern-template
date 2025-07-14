const SECRET_TOKEN = process.env.SECRET_TOKEN;
const ENVIROMENT = process.env.ENVIROMENT;
const IS_PRODUCTION = ENVIROMENT === "production";
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST;

const MONGO_DB_URI_PRODUCTION = process.env.MONGO_DB_URI_PRODUCTION;
const MONGO_DB_URI_DEVELOPMENT = process.env.MONGO_DB_URI_DEVELOPMENT;

const MONGO_DB_URL = IS_PRODUCTION ? MONGO_DB_URI_PRODUCTION : MONGO_DB_URI_DEVELOPMENT;
const ALLOWED_DOMAINS = [
  "http://127.0.0.1:3000",
  "http://localhost:3000",
  "http://127.0.0.1:4000",
  "http://localhost:4000",
];

const RATE_LIMITS = {
  windowMs: 2 * 60 * 1000, // 2 minutes
  max: 500, // limit each IP to 200 requests per windowMs
};

const SERVER = {
  PORT,
  HOST,
  API: {
    MONGO_DB_URL,
    SECRET_TOKEN,
    IS_PRODUCTION,
    ENVIROMENT,
    ALLOWED_DOMAINS,
    RATE_LIMITS,
  },
};

module.exports = SERVER;
