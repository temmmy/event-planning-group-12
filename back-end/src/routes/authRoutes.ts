// RMIT University Vietnam
//   Course: COSC2769 Full Stack Development
//   Semester: 2025A
//   Assessment: Assignment 3
//   Author: GROUP 12
//   Student Name: Nguyen Chi Nghia, Nguyen Bao Hoang, Minh Tran Quang, Hieu Nguyen Minh

import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  debugSession,
} from "../controllers/authController";

// Simple middleware example to protect routes
import { isAuthenticated } from "../middleware/authMiddleware"; // We'll create this next

const router = express.Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/debug-session", debugSession); // Debug route for development

// Private routes (require authentication)
router.post("/logout", isAuthenticated, logoutUser);
router.get("/me", isAuthenticated, getCurrentUser); // Get current user info

export default router;
