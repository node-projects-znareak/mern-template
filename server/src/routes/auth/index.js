const express = require("express");
const router = express.Router();
const validate = require("@helpers/validate");
const authController = require("@controllers/auth");
const { loginSchemaValidation, signupSchemaValidation } = require("@schemas/auth");

router.post("/login", validate(loginSchemaValidation), authController.login);
router.post("/signup", validate(signupSchemaValidation), authController.signup);

module.exports = router;
