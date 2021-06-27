const UserModel = require("../models/User");

class UserController {
  async existsUser(email) {
    const user = await UserModel.findOne({ email }).lean();
    return user;
  }

  async getUserById(id) {
    const user = await UserModel.findById(id).lean();
    return user;
  }

  async createUser(payload) {
    const user = new UserModel(payload);
    return new Promise((resolve, reject) => {
      user.save((err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  }
}

module.exports = new UserController();
