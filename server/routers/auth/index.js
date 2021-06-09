const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const existsToken = require("../../middlewares/existsToken");
const { SECRET_TOKEN } = require("../../config/variables").SERVER.API;
const existsUser = require("../../controllers/existsUser");
const { unauthorized, success } = require("../../helpers/httpResponses");

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await existsUser({ email, password });
    if (user) {
      const token = jwt.sign({ ...user }, SECRET_TOKEN);
      return success(res, { user, token });
    }
    unauthorized(res, "Usuario o clave incorrecta");
  } catch (err) {
    next(err);
  }
});

router.get("/verify-token", existsToken, (req, res, next) => {
  try {
    success(res, { token: req.token });
  } catch (err) {
    next(err);
  }
});
module.exports = router;
