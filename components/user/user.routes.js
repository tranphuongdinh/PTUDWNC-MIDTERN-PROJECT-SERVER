import express from "express";
import { USER_ROUTE } from "../../constants/routes.js";
import authenticationMiddleware from "../../middleware/auth.middleware.js";
import { getCurrentUser } from "./user.controller.js";
const router = express.Router();

router.get(USER_ROUTE.CURRENT_USER, authenticationMiddleware, getCurrentUser);

export default router;
