const express = require("express");
const router = express.Router();
const existsToken = require("../middlewares/existsToken");

const authRouters = require("./auth");
//const yourPrivateRouters = require("./");

router.use("/auth", authRouters);
// router.use("/your-private-routers", existsToken, imageRouters);

module.exports = router;
