import { Request, Response, NextFunction } from "express";

/**
 * Middleware to check if the user has one of the allowed roles.
 * Requires isAuthenticated middleware to be used first in the route chain.
 *
 * Example usage: checkRole(["admin", "organizer"])
 */
export const checkRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const userRole = req.session?.user?.role;

    if (!userRole) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }

    if (allowedRoles.includes(userRole)) {
      next();
    } else {
      res.status(403).json({
        message: `Forbidden: Requires one of the following roles: ${allowedRoles.join(
          ", "
        )}`,
      });
    }
  };
};
