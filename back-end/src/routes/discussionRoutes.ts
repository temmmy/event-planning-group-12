import express from "express";
import {
  getEventDiscussion,
  addMessage,
  deleteMessage,
} from "../controllers/discussionController";
import { isAuthenticated } from "../middleware/authMiddleware";

const router = express.Router({ mergeParams: true }); // mergeParams to access eventId from parent route

// Get discussion for an event
router.get("/", isAuthenticated, getEventDiscussion);

// Add a message to the discussion
router.post("/messages", isAuthenticated, addMessage);

// Delete a message from the discussion
router.delete("/messages/:messageId", isAuthenticated, deleteMessage);

export default router;
