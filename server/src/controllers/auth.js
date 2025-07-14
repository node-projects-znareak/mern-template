const UserService = require("@services/user");
const { success, error } = require("@helpers/httpResponses");
const { hashPassword, createUserJwt, isInvalidPassword } = require("@helpers/index");

class AuthController {
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const user = await UserService.existsUser(email);
      if (user) {
        if (isInvalidPassword(password, user.password))
          return error(res, "Usuario o clave incorrecta");

        delete user.password;
        const token = createUserJwt(user);
        return success(res, { user, token });
      }
      error(res, "Usuario o clave incorrecta");
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

      const token = createUserJwt(userCreated);
      success(res, { user: userCreated, token }, 201);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AuthController();
