const { IS_PRODUCTION, COOKIE_EXPIRE_DAYS } = require("../config/variables")
  .SERVER.API;
const UserService = require("../services/userService");
const { unauthorized, success, error } = require("../helpers/httpResponses");
const {
  hashPassword,
  getTokenFromPayload,
  isInvalidPassword,
} = require("../helpers/utils");

class AuthController {
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const user = await UserService.existsUser(email);
      if (user) {
        if (isInvalidPassword(password, user.password))
          return unauthorized(res, "Usuario o clave incorrecta");

        delete user.password;
        const token = getTokenFromPayload(user);
        res.cookie("token", token, {
          httpOnly: IS_PRODUCTION,
          secure: IS_PRODUCTION,
          sameSite: IS_PRODUCTION ? "none" : "lax",
          expires: new Date(Date.now() + COOKIE_EXPIRE_DAYS * 24 * 3600 * 1000),
        });
        return success(res, { user, token });
      }
      unauthorized(res, "Usuario o clave incorrecta");
    } catch (err) {
      next(err);
    }
  }

  async signup(req, res, next) {
    try {
      const { email, password, name } = req.body;
      const user = await UserService.existsUser(email);
      if (user) return error(res, "El correo ya está en uso");

      const passwordHashed = hashPassword(password);
      const userCreated = await UserService.createUser({
        name,
        email,
        password: passwordHashed,
      });

      success(res, userCreated, 201);
    } catch (err) {
      next(err);
    }
  }

  logout(req, res, next) {
    try {
      const user = req.user.name;
      res.clearCookie("token");
      success(res, `El usuario ${user} se deslogueo correctamente`);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AuthController();
