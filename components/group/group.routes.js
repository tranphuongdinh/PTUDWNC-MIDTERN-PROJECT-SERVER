import express from "express";
import authenticationMiddleware from "../../middleware/auth.middleware.js";
import { createGroup, createInviteLink, getGroupByIds, getGroupDetail, inviteByLink, removeMember, upgradeRole } from "./group.controller.js";

const router = express.Router();

// POST: Interact with member
router.post("/create", authenticationMiddleware, createGroup);
router.post("/link", authenticationMiddleware, createInviteLink);
router.post("/invite", inviteByLink);
router.post("/role", authenticationMiddleware, upgradeRole);
router.post("/remove", authenticationMiddleware, removeMember);

// GET: Member and Group Data
router.get("/detail/:groupId", authenticationMiddleware, getGroupDetail);
router.post("/list", authenticationMiddleware, getGroupByIds);

export default router;
