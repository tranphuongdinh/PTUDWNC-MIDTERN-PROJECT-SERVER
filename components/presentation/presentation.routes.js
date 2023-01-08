import express from "express";
import authenticationMiddleware from "../../middleware/auth.middleware.js";
import { addCollaborator, assignPresentationToGroup, createPresentation, deletePresentation, getGroupPresentation, getPresentationByIds, getQuestions, presentationDetail, removeCollaborator, removeGroupFromPresentation, updatePresentation } from "./presentation.controller.js";
const router = express.Router();

// POST: Interact with member
router.post("/create", authenticationMiddleware, createPresentation);
router.put("/update", authenticationMiddleware, updatePresentation);
router.delete("/delete", authenticationMiddleware, deletePresentation);
router.get("/detail/:id", presentationDetail);
router.post("/list", authenticationMiddleware, getPresentationByIds)

// Colaborations
router.post("/collaboration/add",authenticationMiddleware, addCollaborator )
router.put('/collaboration/remove', authenticationMiddleware, removeCollaborator)

// Question
router.get("/questions/:id", getQuestions);

// Assign group to presentation
router.get("/assign-group", authenticationMiddleware, getGroupPresentation)
router.post("/assign-group", authenticationMiddleware, assignPresentationToGroup);
router.post("/remove-assign-group", authenticationMiddleware, removeGroupFromPresentation);


export default router;