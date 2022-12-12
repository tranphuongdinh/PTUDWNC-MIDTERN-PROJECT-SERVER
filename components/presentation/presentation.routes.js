import express from "express";
import authenticationMiddleware from "../../middleware/auth.middleware.js";
import { createPresentation, updatePresentation, deletePresentaion } from "./presentation.controller.js";
const router = express.Router();

// POST: Interact with member
router.post("/create", authenticationMiddleware, createPresentation);
router.put("/update", authenticationMiddleware, updatePresentation);
router.delete("/delete", authenticationMiddleware, deletePresentaion);

export default router;