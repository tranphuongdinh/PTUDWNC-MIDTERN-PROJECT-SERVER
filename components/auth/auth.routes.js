import express from "express";
import { sendEmail } from "../../config/email/emailService.js";
import { AUTH_ROUTE } from "../../constants/routes.js";
import authenticationMiddleware from "../../middleware/auth.middleware.js";
import { login, loginWithGoogle, register } from "./auth.controller.js";

const router = express.Router();

router.post(AUTH_ROUTE.LOGIN, login);
router.post(AUTH_ROUTE.REGISTER, register);

router.post(AUTH_ROUTE.GITHUB_LOGIN, loginWithGoogle);

router.post(AUTH_ROUTE.GOOGLE_LOGIN, loginWithGoogle);

// router.get("/test", authenticationMiddleware, (req, res) => {
//   res.json({ name: "thoi" });
// });

router.get("/test", (req, res) => {
  sendEmail("boombeachbill@gmail.com", "covala1207@nubotel.com", "OK", "Yes sir");
  res.send({ status: "Success" });
});

export default router;
