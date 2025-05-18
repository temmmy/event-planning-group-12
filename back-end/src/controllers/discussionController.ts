import { Request, Response } from "express";
import mongoose from "mongoose";
import Discussion from "../models/discussion";
import Event from "../models/event";

/**
 * @desc    Get event discussion
 * @route   GET /api/events/:eventId/discussion
 * @access  Private - Only visible to event attendees and organizer
 */
export const getEventDiscussion = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { eventId } = req.params;
    const userId = req.session?.user?.userId;

    if (!userId) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      res.status(400).json({ message: "Invalid event ID" });
      return;
    }

    // Check if the event exists
    const event = await Event.findById(eventId);
    if (!event) {
      res.status(404).json({ message: "Event not found" });
      return;
    }

    // Check if user is the organizer or an attendee
    const isOrganizer = event.organizer.toString() === userId;
    const isAdmin = req.session?.user?.role === "admin";

    // For attendees, we need to check the structure: array of objects with {user, status}
    const isAttendee = event.attendees.some(
      (attendee) => attendee.user && attendee.user.toString() === userId
    );

    if (!isOrganizer && !isAttendee && !isAdmin) {
      res.status(403).json({
        message: "You must be the organizer or an attendee to view discussions",
      });
      return;
    }

    // Find or create discussion
    let discussion = await Discussion.findOne({ event: eventId })
      .populate({
        path: "messages.author",
        select: "username email profileImage",
      })
      .lean();

    if (!discussion) {
      // Create a new discussion board if it doesn't exist
      const newDiscussion = new Discussion({
        event: eventId,
        messages: [],
      });
      await newDiscussion.save();
      discussion = await Discussion.findOne({ event: eventId }).lean();
    }

    res.status(200).json(discussion);
  } catch (error: any) {
    console.error("Error fetching discussion:", error);
    res.status(500).json({
      message: "Error fetching discussion",
      error: error.message,
    });
  }
};

/**
 * @desc    Add a message to event discussion
 * @route   POST /api/events/:eventId/discussion/messages
 * @access  Private - Only available to event attendees and organizer
 */
export const addMessage = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { eventId } = req.params;
    const { content } = req.body;
    const userId = req.session?.user?.userId;

    if (!userId) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    // Validate content
    if (!content || content.trim() === "") {
      res.status(400).json({ message: "Message content cannot be empty" });
      return;
    }

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      res.status(400).json({ message: "Invalid event ID" });
      return;
    }

    // Check if the event exists
    const event = await Event.findById(eventId);
    if (!event) {
      res.status(404).json({ message: "Event not found" });
      return;
    }

    // Check if user is the organizer or an attendee
    const isOrganizer = event.organizer.toString() === userId;
    const isAdmin = req.session?.user?.role === "admin";

    // For attendees, we need to check the structure: array of objects with {user, status}
    const isAttendee = event.attendees.some(
      (attendee) => attendee.user && attendee.user.toString() === userId
    );

    if (!isOrganizer && !isAttendee && !isAdmin) {
      res.status(403).json({
        message: "You must be the organizer or an attendee to add messages",
      });
      return;
    }

    // Find discussion or create a new one if it doesn't exist
    let discussion = await Discussion.findOne({ event: eventId });
    if (!discussion) {
      discussion = new Discussion({
        event: eventId,
        messages: [],
      });
    }

    // Add the new message
    discussion.messages.push({
      author: userId,
      content,
      createdAt: new Date(),
    });

    await discussion.save();

    // Return the updated discussion with populated author fields
    const updatedDiscussion = await Discussion.findOne({ event: eventId })
      .populate({
        path: "messages.author",
        select: "username email profileImage",
      })
      .lean();

    res.status(201).json(updatedDiscussion);
  } catch (error: any) {
    console.error("Error adding message:", error);
    res.status(500).json({
      message: "Error adding message",
      error: error.message,
    });
  }
};

/**
 * @desc    Delete a message from event discussion
 * @route   DELETE /api/events/:eventId/discussion/messages/:messageId
 * @access  Private - Only available to message author, event organizer, or admin
 */
export const deleteMessage = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { eventId, messageId } = req.params;
    const userId = req.session?.user?.userId;
    const userRole = req.session?.user?.role;

    if (!userId) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      res.status(400).json({ message: "Invalid event ID" });
      return;
    }

    // Find the discussion
    const discussion = await Discussion.findOne({ event: eventId });
    if (!discussion) {
      res.status(404).json({ message: "Discussion not found" });
      return;
    }

    // Find the message
    const messageIndex = discussion.messages.findIndex(
      (msg) => msg._id.toString() === messageId
    );

    if (messageIndex === -1) {
      res.status(404).json({ message: "Message not found" });
      return;
    }

    // Check if user is allowed to delete this message (message author, event organizer, or admin)
    const message = discussion.messages[messageIndex];
    const isMessageAuthor = message.author.toString() === userId;
    const isAdmin = userRole === "admin";

    // Get event to check if user is organizer
    const event = await Event.findById(eventId);
    if (!event) {
      res.status(404).json({ message: "Event not found" });
      return;
    }

    const isOrganizer = event.organizer.toString() === userId;

    if (!isMessageAuthor && !isOrganizer && !isAdmin) {
      res.status(403).json({
        message:
          "You must be the message author, event organizer, or admin to delete this message",
      });
      return;
    }

    // Remove the message
    discussion.messages.splice(messageIndex, 1);
    await discussion.save();

    res.status(200).json({ message: "Message deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting message:", error);
    res.status(500).json({
      message: "Error deleting message",
      error: error.message,
    });
  }
};
