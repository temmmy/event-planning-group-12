import { Request, Response, NextFunction } from "express";

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
    res.status(401).json({ message: "Not authenticated" });
  }
};

// Example of Role-based access middleware (Optional - can be expanded later)
// export const isAdmin = (req: Request, res: Response, next: NextFunction): void => {
//     if (req.session && req.session.user && req.session.user.role === 'admin') {
//         next();
//     } else {
//         res.status(403).json({ message: 'Forbidden: Requires admin role' });
//     }
// };
