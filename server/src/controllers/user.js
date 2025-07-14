const UserService = require("@services/user");
const { success, error } = require("@helpers/httpResponses");

class UserController {
  async changePassword(req, res, next) {
    try {
      const { password, passwordConfirm } = req.body;
      const id = req.user._id;
      if (password !== passwordConfirm) {
        return error(res, "Las contraseñas no coinciden", 400);
      }
      const userUpdated = await UserService.changePassword({ id, password });
      success(res, userUpdated);
    } catch (err) {
      next(err);
    }
  }

  getUserSession(req, res, next) {
    try {
      const user = req.session.user;
      success(res, user);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new UserController();
