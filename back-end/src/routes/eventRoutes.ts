import express from "express";
import {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  inviteToEvent,
  respondToInvitation,
  getEventStatistics,
  requestToJoinEvent,
  handleJoinRequest,
} from "../controllers/eventController";
import { isAuthenticated } from "../middleware/authMiddleware";
import upload from "../middleware/uploadMiddleware";
import discussionRoutes from "./discussionRoutes";

const router = express.Router();

// Get all events and event by ID
router.get("/", getEvents);

// Admin statistics route - must be before /:id route to avoid conflict
router.get("/statistics", isAuthenticated, getEventStatistics);

// Get event by ID
router.get("/:id", getEventById);

// Event CRUD routes with authentication
router.post(
  "/",
  isAuthenticated,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  createEvent
);

router.put(
  "/:id",
  isAuthenticated,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  updateEvent
);

router.delete("/:id", isAuthenticated, deleteEvent);

// Invitation routes
router.post("/:id/invite", isAuthenticated, inviteToEvent);
router.put("/:id/respond", isAuthenticated, respondToInvitation);

// Join request routes for public events
router.post("/:id/request-join", isAuthenticated, requestToJoinEvent);
router.put("/:id/join-request/:userId", isAuthenticated, handleJoinRequest);

// Discussion routes - nested under events
router.use("/:eventId/discussion", discussionRoutes);

export default router;
