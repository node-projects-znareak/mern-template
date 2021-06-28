const express = require("express");
const router = express.Router();
const existsToken = require("../../middlewares/existsToken");
const { existsUser, createUser } = require("../../controllers/userController");
const { unauthorized, success, error } = require("../../helpers/httpResponses");
const {
  validateLoginBody,
  validateRegisterBody,
} = require("../../middlewares/validations");
const {
  isInvalidPassword,
  getTokenFromPayload,
  hashPassword,
} = require("../../helpers/utils");

router.post("/login", validateLoginBody, async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await existsUser(email);
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

router.post("/signup", validateRegisterBody, async (req, res, next) => {
  try {
    const { email, password, name } = req.body;
    const user = await existsUser(email);
    if (user) return error(res, "El correo ya está en uso");

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
