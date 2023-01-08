import express from "express";
import authenticationMiddleware from "../../middleware/auth.middleware.js";
import { createGroup, createInviteLink, delGroupByIds, getAssignedPresentation, getGroupByIds, getGroupDetail, inviteByLink, removeMember, sendEmailInvite, upgradeRole } from "./group.controller.js";

const router = express.Router();

// POST: Interact with member
router.post("/create", authenticationMiddleware, createGroup);
router.post("/link", authenticationMiddleware, createInviteLink);
router.post("/invite", inviteByLink);
router.post("/send-invite-email", sendEmailInvite)
router.post("/role", authenticationMiddleware, upgradeRole);
router.post("/remove", authenticationMiddleware, removeMember);

// GET: Member and Group Data
router.get("/detail/:groupId", authenticationMiddleware, getGroupDetail);
router.post("/list", authenticationMiddleware, getGroupByIds);
router.delete("/list/:id", authenticationMiddleware, delGroupByIds);

// Get assign presentation
router.post("/assigned-presentation", authenticationMiddleware, getAssignedPresentation);

export default router;
