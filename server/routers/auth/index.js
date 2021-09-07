const express = require("express");
const router = express.Router();
const validate = require("../../helpers/validations/validate");

const {
  loginSchemaValidation,
  signupSchemaValidation,
} = require("../../helpers/validations/validations");
const authController = require("../../controllers/authController");
const existsToken = require("../../middlewares/existsToken");

router.post("/login", validate(loginSchemaValidation), authController.login);
router.post("/signup", validate(signupSchemaValidation), authController.signup);
router.get("/logout", existsToken, authController.logout);

module.exports = router;
