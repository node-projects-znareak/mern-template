const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const existsToken = require("../../middlewares/existsToken");
const bcrypt = require("bcryptjs");
const { validateLogin } = require("../../helpers/validations");
const { SECRET_TOKEN } = require("../../config/variables").SERVER.API;
const existsUser = require("../../controllers/existsUser");
const { unauthorized, success, error } = require("../../helpers/httpResponses");

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const isInvalidPayload = validateLogin.validate({ email, password }).error;
    if (isInvalidPayload) {
      return error(res, isInvalidPayload.details[0].message);
    }

    const user = await existsUser({ email, password });
    if (user) {
      const isValidPassword = bcrypt.compareSync(password, user.password);
      if (!isValidPassword) return unauthorized(res, "Clave incorrecta");

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
