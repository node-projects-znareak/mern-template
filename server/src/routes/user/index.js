const express = require("express");
const router = express.Router();
const userController = require("@controllers/user");
const validate = require("@helpers/validate");
const { passwordChangeValidation } = require("@schemas/auth");

router.get("/", userController.getUserSession);

router.patch("/password", validate(passwordChangeValidation), userController.changePassword);


module.exports = router;
