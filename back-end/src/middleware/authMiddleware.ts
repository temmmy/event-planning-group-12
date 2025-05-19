// RMIT University Vietnam
//   Course: COSC2769 Full Stack Development
//   Semester: 2025A
//   Assessment: Assignment 3
//   Author: GROUP 12
//   Student Name: Nguyen Chi Nghia, Nguyen Bao Hoang, Minh Tran Quang, Hieu Nguyen Minh

import { Request, Response, NextFunction } from "express";
import { Session } from "express-session";
import mongoose from "mongoose";
import user from "../models/user";

// Extend the session interface to include our user property
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
 * Middleware to check if the user is authenticated via session.
 */
export const isAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Check if the user object exists on the session
  if (req.session && req.session.user) {
    // User is authenticated, proceed to the next middleware or route handler
    next();
  } else {
    // User is not authenticated
    console.log(req.session.user);
    res.status(401).json({ message: "Not authenticated idiot" });
  }
};

/**
 * Middleware to check if the user is an admin.
 * Requires isAuthenticated to be used first in the route chain.
 */
export const isAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Check user role directly from session
  if (req.session?.user?.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Forbidden: Requires admin role" });
  }
};
