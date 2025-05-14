import express from "express";
import { getSettings, updateSettings } from "../controllers/settingsController";
import { isAuthenticated, isAdmin } from "../middleware/authMiddleware";

const router = express.Router();

// Both routes require admin privileges
router.get("/", isAuthenticated, isAdmin, getSettings);
router.put("/", isAuthenticated, isAdmin, updateSettings);

export default router;
