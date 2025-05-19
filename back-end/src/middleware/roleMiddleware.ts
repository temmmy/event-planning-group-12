// RMIT University Vietnam
//   Course: COSC2769 Full Stack Development
//   Semester: 2025A
//   Assessment: Assignment 3
//   Author: GROUP 12
//   Student Name: Nguyen Chi Nghia, Nguyen Bao Hoang, Minh Tran Quang, Hieu Nguyen Minh

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
    console.log(userRole);

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
