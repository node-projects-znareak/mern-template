require("dotenv").config();

const MONGO_DB = {
  URL: process.env.MONGODB_URL,
};

const SERVER = {
  PORT: process.env.API_PORT || 6000,
  DEV: process.env.DEV || false,
  API: {
    COOKIE_EXPIRE_DAYS: 2,
    SALT_BCRYPT: process.env.SALT_BCRYPT,
    SECRET_TOKEN: process.env.SECRET_TOKEN,
    SECRET_TOKEN_SESSION: process.env.SECRET_TOKEN_SESSION,
    SECRET_TOKEN_COOKIE: process.env.SECRET_TOKEN_COOKIE,
    IS_PRODUCTION: process.env.NODE_ENV === "production",
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
