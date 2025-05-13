import express from "express";
import { isAuthenticated } from "../middleware/authMiddleware";
import {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  inviteToEvent,
  respondToInvitation,
} from "../controllers/eventController";
import multer from "multer";

const router = express.Router();

// Configure multer for memory storage (we'll handle file saving in the controller)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit (will be checked against settings in controller)
  },
});

// Public routes
router.get("/", getEvents);
router.get("/:id", getEventById);

// Protected routes (require authentication)
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

export default router;
