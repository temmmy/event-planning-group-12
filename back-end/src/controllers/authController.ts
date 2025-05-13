import { Request, Response } from "express";
import User, { IUser } from "../models/user";
import bcrypt from "bcrypt";
import mongoose from "mongoose";

// Extend Express session interface to include user property
declare module "express-session" {
  interface SessionData {
    user?: {
      userId?: string;
      username: string;
      email: string;
      role: "admin" | "organizer" | "attendee";
    };
  }
}

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const registerUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { username, email, password, role } = req.body;

  // --- Basic Validation ---
  if (!username || !email || !password) {
    res
      .status(400)
      .json({ message: "Please provide username, email, and password" });
    return;
  }
  // TODO: Add more robust validation (e.g., email format, password strength)

  try {
    // --- Check if user exists ---
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      res.status(409).json({ message: "Username or email already exists" }); // 409 Conflict
      return;
    }

    // --- Create new user (Password hashing is handled by pre-save middleware in model) ---
    const newUser = new User({
      username,
      email,
      password, // Pass plain password, it will be hashed by the model
      role: role || "attendee", // Default to attendee if role not provided
    });

    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
};

/**
 * @desc    Authenticate user and login
 * @route   POST /api/auth/login
 * @access  Public
 */
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body; // Allow login with email

  // --- Basic Validation ---
  if (!email || !password) {
    res.status(400).json({ message: "Please provide email and password" });
    return;
  }

  try {
    // --- Find user by email ---
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ message: "Invalid credentials" }); // Unauthorized
      return;
    }

    // --- Compare password (using method defined in model) ---
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ message: "Invalid credentials" }); // Unauthorized
      return;
    }

    // --- Password matches - Establish session ---
    // Regenerate session to prevent fixation
    req.session.regenerate((err) => {
      if (err) {
        console.error("Session regeneration error:", err);
        return res.status(500).json({ message: "Server error during login" });
      }

      // Store user info in session (do NOT store password)
      req.session.user = {
        userId: (user._id as mongoose.Types.ObjectId).toString(),
        email: user.email,
        username: user.username,
        role: user.role,
      };

      console.log("Session created for user:", req.session.user);

      // Respond with success (including some user info)
      res.status(200).json({
        message: "Login successful",
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      });
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Private (Requires user to be logged in)
 */
export const logoutUser = (req: Request, res: Response): void => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout Error:", err);
      return res.status(500).json({ message: "Failed to logout." });
    }
    // Ensure the cookie is cleared
    res.clearCookie("connect.sid"); // Use the default session cookie name or the name you configured
    res.status(200).json({ message: "Logout successful" });
  });
};

/**
 * @desc    Get current logged-in user details from session
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getCurrentUser = (req: Request, res: Response): void => {
  if (req.session.user) {
    // Optionally fetch fresh user data from DB if needed
    // const user = await User.findById(req.session.user.userId).select('-password');
    res.status(200).json({ user: req.session.user });
  } else {
    res.status(401).json({ message: "Not authenticated" });
  }
};

/**
 * @desc    Debug endpoint to check session data
 * @route   GET /api/auth/debug-session
 * @access  Public (but intended for development use only)
 */
export const debugSession = (req: Request, res: Response): void => {
  // Show what's in the session
  console.log("Debug session request received");
  console.log("Session ID:", req.sessionID);
  console.log("Session data:", req.session);
  console.log("Cookies:", req.headers.cookie);

  // Return session info (do NOT use this in production as-is!)
  res.status(200).json({
    sessionID: req.sessionID,
    cookies: req.headers.cookie,
    session: req.session,
    user: req.session.user || "No user in session",
  });
};
