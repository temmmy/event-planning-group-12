// RMIT University Vietnam
//   Course: COSC2769 Full Stack Development
//   Semester: 2025A
//   Assessment: Assignment 3
//   Author: GROUP 12
//   Student Name: Nguyen Chi Nghia, Nguyen Bao Hoang, Minh Tran Quang, Hieu Nguyen Minh

import express from "express";
import { isAuthenticated } from "../middleware/authMiddleware";
import {
  getUserNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  processEventReminders,
  configureEventReminders,
  notifyEventUpdate,
} from "../controllers/notificationController";
import { checkRole } from "../middleware/roleMiddleware";

const router = express.Router();

// User notification routes
router.get("/", isAuthenticated, getUserNotifications);
router.put("/:id/read", isAuthenticated, markNotificationRead);
router.put("/read-all", isAuthenticated, markAllNotificationsRead);

// Event reminders and notification routes
router.post("/process-reminders", processEventReminders);
router.post("/events/:id/reminders", isAuthenticated, configureEventReminders);
router.post("/events/:id/notify-update", isAuthenticated, notifyEventUpdate);

export default router;
