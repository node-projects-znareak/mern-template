const express = require("express");
const router = express.Router();
const existsToken = require("../middlewares/existsToken");
const authRouters = require("./auth");
const userRouters = require("./user");

router.use("/auth", authRouters);
router.use("/user", existsToken, userRouters);

module.exports = router;
