const { hashPassword } = require("@helpers/index");

class UserService {
  constructor() {
    this.UserModel = require("@models/user");
    this.optionsUpdate = { new: true };
  }

  async createUser(payload) {
    const user = new this.UserModel(payload);
    const result = await user.save();
    const userObject = result.toObject();
    delete userObject.password;
    return userObject;
  }

  async existsUser(email) {
    const user = await this.UserModel.findOne({ email }).lean();
    return user;
  }

  async isEmailInUse(email) {
    const users = await this.UserModel.find({ email }).lean();
    return users.length > 0;
  }

  async isUsernameInUse(username) {
    const users = await this.UserModel.find({ username }).lean();
    return users.length > 0;
  }

  async getUserById(id) {
    const user = await this.UserModel.findById(id, { password: 0 }).lean();
    return user;
  }

  async setPerfilPhoto({ id, perfil_photo }) {
    const userUpdated = await this.UserModel.findByIdAndUpdate(
      id,
      { perfil_photo },
      this.optionsUpdate
    ).lean();
    return userUpdated;
  }

  async changePassword({ id, password }) {
    const userUpdated = await this.UserModel.findByIdAndUpdate(
      id,
      { password: hashPassword(password) },
      this.optionsUpdate
    ).lean();
    delete userUpdated.password;
    return userUpdated;
  }
}

module.exports = new UserService();
