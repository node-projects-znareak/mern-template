const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const os = require("os");
const Table = require("cli-table");
const pretty = require("pino-pretty");
const pino = require("pino");

const { JWT_SECRET_TOKEN, JWT_SALT_TOKEN } = require("@config/variables").API;

const logger = pino(
  pretty({
    colorize: true,
    sync: true,
  })
);

const table = new Table({
  head: ["Route", "Method", "Controller"],
  colors: ["white"],
  colWidths: [55, 18, 70],
});

function getLocalIP() {
  const networkInterfaces = os.networkInterfaces();
  for (const _interface of Object.values(networkInterfaces)) {
    for (const config of _interface) {
      if (config.family === "IPv4" && !config.internal) {
        return config.address;
      }
    }
  }
  return "0.0.0.0";
}

const message = {
  success(str) {
    logger.info(`${str}`);
  },

  error(str, err = null) {
    logger.error(`${str}`);
    err && logger.error(`Error message: ${err}`);
  },

  warn(str) {
    logger.warn(`${str.toString()}`);
  },
};

/**
 * Checks if a password is invalid by comparing it with a hashed password.
 * @param {string} hashedPassword - The hashed password.
 * @param {string} password - The plain text password.
 * @returns {boolean} True if the password is invalid, false otherwise.
 */
function isInvalidPassword(hashedPassword, password) {
  const result = bcrypt.compareSync(hashedPassword, password);
  return !result;
}

/**
 * Checks if a request is an AJAX or API request.
 * @param {Object} req - The request object.
 * @returns {boolean} True if the request is an AJAX or API request, false otherwise.
 */
function isRequestAjaxOrApi(req) {
  return !req.accepts("html") || req.xhr;
}

/**
 * Encrypts a payload using bcrypt with the given salt.
 * @param {string} payload - The payload to encrypt.
 * @param {string} [SALT=JWT_SALT_TOKEN] - The salt to use for encryption.
 * @returns {string} The hashed payload.
 */
function encryptPayload(payload, SALT = JWT_SALT_TOKEN) {
  const salt = bcrypt.genSaltSync(parseInt(SALT));
  const hash = bcrypt.hashSync(payload, salt);
  return hash;
}

/**
 * Hashes a password using bcrypt.
 * @param {string} password - The password to hash.
 * @returns {string} The hashed password.
 */
function hashPassword(password) {
  return encryptPayload(password);
}

/**
 * Creates a JSON Web Token (JWT) for a regular user.
 * @param {Object} payload - The payload for the JWT.
 * @returns {string} The generated JWT.
 */
function createUserJwt(payload) {
  const token = jwt.sign(payload, JWT_SECRET_TOKEN, {
    expiresIn: "75d",
  });
  return token;
}

/**
 * Extracts information from a user JWT.
 * @param {string} token - The JWT.
 * @param {Object} [options={}] - Additional options for verification.
 * @returns {Promise<Object>} The payload extracted from the JWT.
 */
function getInfoFromUserJwt(token, options = {}) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, JWT_SECRET_TOKEN, options, (err, payload) => {
      if (err) return reject(new Error(err));
      resolve(payload);
    });
  });
}

/**
 * Formats a schema validation error into an array of error messages.
 * @param {Object} err - The error object.
 * @returns {Array<Object>} An array of error messages with path and message.
 */
function formatSchemaError(err) {
  if (err.name !== "ValidationError") {
    return [err.message];
  }

  // Collect all errors into an array
  const errorMessages = [];
  if (err.inner && err.inner.length > 0) {
    err.inner.forEach((innerErr) => {
      errorMessages.push({
        path: innerErr.path,
        message: innerErr.message,
      });
    });
  } else {
    errorMessages.push({
      path: err.path,
      message: err.message,
    });
  }

  return errorMessages;
}

module.exports = {
  getLocalIP,
  isInvalidPassword,
  isRequestAjaxOrApi,
  encryptPayload,
  hashPassword,
  createUserJwt,
  getInfoFromUserJwt,
  formatSchemaError,
  table,
  logger,
  message,
};
