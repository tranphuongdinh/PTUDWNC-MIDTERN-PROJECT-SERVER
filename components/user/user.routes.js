import express from "express";
import { USER_ROUTE } from "../../constants/routes.js";
import authenticationMiddleware from "../../middleware/auth.middleware.js";
import { getCurrentUser, getUserByIds, sendVerificationEmail, updateUser } from "./user.controller.js";
const router = express.Router();

router.get(USER_ROUTE.CURRENT_USER, authenticationMiddleware, getCurrentUser);

router.put(USER_ROUTE.UPDATE_USER, authenticationMiddleware, updateUser);

router.post(USER_ROUTE.GET_USERS_BY_IDS, authenticationMiddleware, getUserByIds);

router.post(USER_ROUTE.SEND_VERIFY_EMAIL, authenticationMiddleware, sendVerificationEmail);

export default router;
