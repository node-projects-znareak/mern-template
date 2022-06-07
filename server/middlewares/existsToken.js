const { invalidToken, unauthorized } = require("../helpers/httpResponses");
const { getTokenInfo } = require("../helpers/utils");

async function existsToken(req, res, next) {
  const headers = req.headers.authorization;
  if (headers) {
    try {
      const token = headers.split(" ")[1];
      if (!token) return invalidToken(res);
      const tokenInfo = await getTokenInfo(token);
      req.token = token;
      req.user = tokenInfo;
      next();
    } catch (error) {
      invalidToken(res);
    }
  } else {
    unauthorized(res, "The authorization header missing");
  }
}

module.exports = existsToken;
