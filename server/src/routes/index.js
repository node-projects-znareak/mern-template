const express = require("express");
const router = express.Router();
const requiredUserAuth = require("@middlewares/index");

const userRouters = require("./user");
const authRouters = require("./auth");


router.use("/user", requiredUserAuth, userRouters);
router.use("/auth", authRouters);

module.exports = router;
