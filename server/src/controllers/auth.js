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
          return error(res, "Invalid username or password");

        delete user.password;
        const token = createUserJwt(user);
        return success(res, { user, token });
      }
      error(res, "Invalid username or password");
    } catch (err) {
      next(err);
    }
  }

  async signup(req, res, next) {
    try {
      const { email, password, username } = req.body;
      const user = await UserService.existsUser(email);
      
      if (user) return error(res, "Email is already in use");

      const passwordHashed = hashPassword(password);
      const userCreated = await UserService.createUser({
        username,
        email,
        password: passwordHashed,
      });

      const token = createUserJwt(userCreated);
      success(res, { user: userCreated, token }, 201);
    } catch (err) {
      next(err);
    }
  }

  async checkEmailAvailability(req, res, next) {
    try {
      const { email } = req.query;
      const isInUse = await UserService.existsUser(email);
      
      return success(res, { 
        email,
        available: !isInUse,
        inUse: isInUse
      });
    } catch (err) {
      next(err);
    }
  }

  async checkUsernameAvailability(req, res, next) {
    try {
      const { username } = req.query;
      const isInUse = await UserService.isUsernameInUse(username);
      
      return success(res, { 
        username,
        available: !isInUse,
        inUse: isInUse
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AuthController();
