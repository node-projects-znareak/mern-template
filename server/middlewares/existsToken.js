const { invalidToken, error } = require("../helpers/httpResponses");
const { getTokenInfo } = require("../helpers/utils");

function existsToken(req, res, next) {
  const token = req.cookies.token;
  if (token) {
    const tokenInfo = getTokenInfo(token);
    if (tokenInfo.isValid) {
      req.token = token;
      req.user = tokenInfo.payload;
      return next();
    }
    return invalidToken(res);
  }
  error(res, "Authorization token missing");
}

module.exports = existsToken;
