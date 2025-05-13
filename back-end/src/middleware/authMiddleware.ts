import { Request, Response, NextFunction } from "express";
import { Session } from "express-session";

// Extended Session interface to include our user property
interface CustomSession extends Session {
  user?: {
    _id: string;
    username: string;
    email: string;
    role: "admin" | "organizer" | "attendee";
  };
}

// Extended Request type to include our custom session
export interface AuthRequest extends Request {
  session: CustomSession;
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
  if (req.session && (req.session as CustomSession).user) {
    // User is authenticated, proceed to the next middleware or route handler
    next();
  } else {
    // User is not authenticated
    res.status(401).json({ message: "Not authenticated" });
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
  const authReq = req as AuthRequest;
  if (
    authReq.session &&
    authReq.session.user &&
    authReq.session.user.role === "admin"
  ) {
    next();
  } else {
    res.status(403).json({ message: "Forbidden: Requires admin role" });
  }
};
