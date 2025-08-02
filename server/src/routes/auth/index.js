const express = require("express");
const router = express.Router();
const validate = require("@helpers/validate");
const authController = require("@controllers/auth");
const { 
  loginSchemaValidation, 
  signupSchemaValidation, 
  checkEmailSchemaValidation 
} = require("@schemas/auth");

router.post("/login", validate(loginSchemaValidation), authController.login);
router.post("/signup", validate(signupSchemaValidation), authController.signup);
router.get("/check-email", validate(checkEmailSchemaValidation), authController.checkEmailAvailability);

module.exports = router;
