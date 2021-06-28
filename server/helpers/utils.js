const chalk = require("chalk");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { SECRET_TOKEN, SALT_BCRYPT } = require("../config/variables").SERVER.API;
const message = {
  success(str) {
    console.log(chalk.greenBright(`[✔️] ${str}`) + "\n");
  },

  error(str, err = null) {
    console.log(chalk.redBright(`[❌] ${str}`) + "\n");
    err && console.log(chalk.redBright(`[❌] Error message: ${err}`) + "\n");
  },

  warn(str) {
    console.log(chalk.yellowBright(`[⚠️] ${str}`) + "\n");
  },
};

function isRequestAjaxOrApi(req) {
  return (
    !req.accepts("text/html") ||
    req.xhr ||
    req.accepts("application/json") ||
    req.accepts("text/plain")
  );
}

function getTokenInfo(token) {
  return jwt.verify(token, SECRET_TOKEN, (err, payload) => ({
    isValid: !err,
    payload,
  }));
}

function hashPassword(password) {
  const salt = bcrypt.genSaltSync(SALT_BCRYPT);
  const hash = bcrypt.hashSync(password, salt);
  return hash;
}

function isInvalidPassword(hashedPassword, password) {
  const result = bcrypt.compareSync(hashedPassword, password);
  return !result;
}

function getTokenFromPayload(payload) {
  const token = jwt.sign({ ...payload }, SECRET_TOKEN, { expiresIn: "1d" });
  return token;
}

module.exports = {
  isRequestAjaxOrApi,
  message,
  getTokenInfo,
  hashPassword,
  isInvalidPassword,
  getTokenFromPayload,
};
