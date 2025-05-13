import "express-session";

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
