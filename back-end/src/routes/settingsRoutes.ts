// RMIT University Vietnam
//   Course: COSC2769 Full Stack Development
//   Semester: 2025A
//   Assessment: Assignment 3
//   Author: GROUP 12
//   Student Name: Nguyen Chi Nghia, Nguyen Bao Hoang, Minh Tran Quang, Hieu Nguyen Minh

import express from "express";
import { getSettings, updateSettings } from "../controllers/settingsController";
import { isAuthenticated, isAdmin } from "../middleware/authMiddleware";

const router = express.Router();

// Both routes require admin privileges
router.get("/", isAuthenticated, isAdmin, getSettings);
router.put("/", isAuthenticated, isAdmin, updateSettings);

export default router;
