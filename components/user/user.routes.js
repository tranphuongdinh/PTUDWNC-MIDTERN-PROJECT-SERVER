import express from "express";
import { USER_ROUTE } from "../../constants/routes.js";
import authenticationMiddleware from "../../middleware/auth.middleware.js";
import { getCurrentUser, getUserByIds, updateUser } from "./user.controller.js";
const router = express.Router();

router.get(USER_ROUTE.CURRENT_USER, authenticationMiddleware, getCurrentUser);

router.put(USER_ROUTE.UPDATE_USER, authenticationMiddleware, updateUser);

router.post(USER_ROUTE.GET_USERS_BY_IDS, authenticationMiddleware, getUserByIds);

export default router;
