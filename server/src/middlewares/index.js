const { error } = require("@helpers/httpResponses");
const { getInfoFromUserJwt,} = require("@helpers/index");
const UserService = require("@services/user");

const requiredUserAuth = async (req, res, next) => {
  try {
    const header = req.get("authorization");

    if (!header) {
      throw new Error("The authorization header is missing");
    }

    const token = header.split(" ")[1];

    if (!token) {
      throw new Error("The authorization token is missing");
    }

    const $user = await getInfoFromUserJwt(token);

    if (!$user || !$user._id) {
      throw new Error("The authorization token is invalid");
    }

    const user = await UserService.getUserById($user._id);

    if (!user) {
      throw new Error("The user does not exist, please try again");
    }

    if (user.password) delete user.password;

    req.session = {
      ...req.session,
      user,
      user_id: user._id,
      token,
    };

    next();
  } catch (err) {
    console.error(err);
    error(res, err.message, 401);
  }
};

module.exports = requiredUserAuth;