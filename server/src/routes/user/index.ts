import userController from "@controllers/user";
import validate from "@helpers/validate";
import { passwordChangeValidation } from "@schemas/auth";
import express from "express";

const router = express.Router();

router.get("/", userController.getUserSession);

router.patch("/password", validate(passwordChangeValidation), userController.changePassword);

export default router;
