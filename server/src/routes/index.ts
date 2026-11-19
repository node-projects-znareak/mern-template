import requiredUserAuth from "@middlewares/index";
import authRouters from "@routes/auth";
import userRouters from "@routes/user";
import express from "express";

const router = express.Router();

router.use("/user", requiredUserAuth, userRouters);
router.use("/auth", authRouters);

export default router;
