require("dotenv").config();

const env = process.env;
const MONGO_DB = {
  URL: env.MONGODB_URL,
};

const SERVER = {
  PORT: env.API_PORT || 6000,
  DEV: env.DEV || false,
  API: {
    COOKIE_EXPIRE_DAYS: 2,
    SALT_BCRYPT: env.SALT_BCRYPT,
    SECRET_TOKEN: env.SECRET_TOKEN,
    SECRET_TOKEN_SESSION: env.SECRET_TOKEN_SESSION,
    SECRET_TOKEN_COOKIE: env.SECRET_TOKEN_COOKIE,
    IS_PRODUCTION: env.NODE_ENV === "production",
    ALLOWED_DOMAINS: [
      "http://127.0.0.1:3000",
      "http://localhost:3000",
      "https://mern-template-ruddy.vercel.app",
    ],
    RATE_LIMITS: {
      windowMs: 10 * 60 * 1000, // 10 minutes
      max: 200, // limit each IP to 200 requests per windowMs
    },
  },
};

module.exports = {
  MONGO_DB,
  SERVER,
};
