const chalk = require("chalk");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { SERVER } = require("../config/variables");
const message = {
  success(str) {
    console.log(chalk.greenBright(`[✔️] ${str}`) + "\n");
  },

  error(str, err = null) {
    console.error(chalk.redBright(`[❌] ${str}`) + "\n");
    err && console.error(chalk.redBright(`[❌] Error message: ${err}`) + "\n");
  },

  warn(str) {
    console.warn(chalk.yellowBright(`[⚠️] ${str}`) + "\n");
  },
};

function getTokenInfo(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, SERVER.API.SECRET_TOKEN, (err, payload) => {
      if (err) return reject(new Error(err));
      resolve(payload);
    });
  });
}

function hashPassword(password) {
  const salt = bcrypt.genSaltSync(parseInt(SERVER.API.SALT_BCRYPT));
  const hash = bcrypt.hashSync(password, salt);
  return hash;
}

function isInvalidPassword(hashedPassword, password) {
  const result = bcrypt.compareSync(hashedPassword, password);
  return !result;
}

function getTokenFromPayload(payload) {
  const token = jwt.sign(payload, SERVER.API.SECRET_TOKEN, {
    expiresIn: "20s",
  });
  return token;
}
  
function isRequestAjaxOrApi(req) {
  return !req.accepts("html") || req.xhr;
}

module.exports = {
  message,
  getTokenInfo,
  hashPassword,
  isInvalidPassword,
  isRequestAjaxOrApi,
  getTokenFromPayload,
};
