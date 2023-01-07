import express from "express";
import authenticationMiddleware from "../../middleware/auth.middleware.js";
import { createPresentation, updatePresentation, deletePresentation, presentationDetail, getPresentationByIds, addCollaborator, removeCollaborator, getQuestions } from "./presentation.controller.js";
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
router.get("/questions/:id", authenticationMiddleware, getQuestions);

export default router;