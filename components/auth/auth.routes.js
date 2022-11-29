import express from "express";
import { sendEmail } from "../../config/email/emailService.js";
import { AUTH_ROUTE } from "../../constants/routes.js";
import { login, loginWithGoogle, register, verifyAccount } from "./auth.controller.js";

const router = express.Router();

router.post(AUTH_ROUTE.LOGIN, login);
router.post(AUTH_ROUTE.REGISTER, register);

router.post(AUTH_ROUTE.GOOGLE_LOGIN, loginWithGoogle);

router.post("/verify", verifyAccount);

export default router;
