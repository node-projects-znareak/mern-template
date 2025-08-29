const express = require("express");
const router = express.Router();
const validate = require("@helpers/validate");
const authController = require("@controllers/auth");
const { 
  loginSchemaValidation, 
  signupSchemaValidation, 
  checkEmailSchemaValidation,
  checkUsernameSchemaValidation
} = require("@schemas/auth");

router.post("/login", validate(loginSchemaValidation), authController.login);
router.post("/signup", validate(signupSchemaValidation), authController.signup);
router.get("/check-email", validate(checkEmailSchemaValidation), authController.checkEmailAvailability);
router.get("/check-username", validate(checkUsernameSchemaValidation), authController.checkUsernameAvailability);

module.exports = router;
