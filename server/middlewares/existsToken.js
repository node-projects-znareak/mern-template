const { error } = require("../helpers/httpResponses");
const { getTokenInfo } = require("../helpers/utils");

function existsToken(req, res, next) {
  const headers = req.headers.authorization;
  if (headers) {
    const token = headers.split(" ")[1];
    req.token = token;
    return getTokenInfo(token).isValid
      ? next()
      : error(res, "The user token is invalid");
  }

  error(res, "The authorization header missing");
}

module.exports = existsToken;
