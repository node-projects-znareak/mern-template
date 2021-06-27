const express = require("express");
const router = express.Router();
const existsToken = require("../../middlewares/existsToken");
const { validateLogin } = require("../../helpers/validations");
const { existsUser, createUser } = require("../../controllers/userController");
const { unauthorized, success, error } = require("../../helpers/httpResponses");
const {
  isInvalidPassword,
  getTokenFromPayload,
  hashPassword,
} = require("../../helpers/utils");

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const isInvalidPayload = validateLogin.validate({ email, password }).error;
    if (isInvalidPayload) {
      return error(res, isInvalidPayload.details[0].message);
    }

    const user = await existsUser(email);
    console.log(user);
    if (user) {
      if (isInvalidPassword(password, user.password))
        return unauthorized(res, "Clave incorrecta");

      delete user.password;
      const token = getTokenFromPayload(user);
      return success(res, { user, token });
    }
    unauthorized(res, "Usuario o clave incorrecta");
  } catch (err) {
    next(err);
  }
});

router.post("/signup", async (req, res, next) => {
  try {
    const { email, password, name } = req.body;
    const passwordHashed = hashPassword(password);
    const userCreated = await createUser({
      name,
      email,
      password: passwordHashed,
    });

    success(res, userCreated, 201);
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
