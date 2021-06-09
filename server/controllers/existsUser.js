const UserModel = require("../models/User");

async function existsUser({ email, password }) {
  const user = await UserModel.findOne(
    { email, password },
    { password: 0 }
  ).lean();
  return user;
}

module.exports = existsUser;
