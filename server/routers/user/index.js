const express = require("express");
const router = express.Router();
const { getTokenInfo } = require("../../helpers/utils");
const UserController = require("../../controllers/userController");
const { success } = require("../../helpers/httpResponses");

router.get("/user", async (req, res, next) => {
  try {
    const user = getTokenInfo(req.token).payload;
    const userFromDb = await UserController.getUserById(user._id);
    delete userFromDb.password;
    delete userFromDb.__v;
    success(res, userFromDb);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
