import express from "express";
import { sendEmail } from "../../config/email/emailService.js";
import { githubLoginMiddleware, githubLoginSuccessMiddleware, googleLoginMiddleware, googleLoginSuccessMiddleware } from "../../config/passport/index.js";
import { AUTH_ROUTE } from "../../constants/routes.js";
import authenticationMiddleware from "../../middleware/auth.middleware.js";
import { login, register } from "./auth.controller.js";

const router = express.Router();

router.post(AUTH_ROUTE.LOGIN, login);
router.post(AUTH_ROUTE.REGISTER, register);

router.get(AUTH_ROUTE.GITHUB_LOGIN, githubLoginMiddleware);
router.get(AUTH_ROUTE.GITHUB_LOGIN_SUCCESS, githubLoginSuccessMiddleware, login);

router.get(AUTH_ROUTE.GOOGLE_LOGIN, googleLoginMiddleware);
router.get(AUTH_ROUTE.GOOGLE_LOGIN_SUCCESS, googleLoginSuccessMiddleware, login);

router.get("/test", authenticationMiddleware, (req, res) => {
  res.json({ name: "thoi" });
});

router.get("/test", (req, res) => {
  sendEmail("boombeachbill@gmail.com", "xasivo3854@klblogs.com", "OK", "Yes sir");
  res.send({ status: "Success" });
});

export default router;
