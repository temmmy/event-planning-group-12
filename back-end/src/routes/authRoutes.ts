import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
} from "../controllers/authController";

// Simple middleware example to protect routes
import { isAuthenticated } from "../middleware/authMiddleware"; // We'll create this next

const router = express.Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Private routes (require authentication)
router.post("/logout", isAuthenticated, logoutUser);
router.get("/me", isAuthenticated, getCurrentUser); // Get current user info

export default router;
