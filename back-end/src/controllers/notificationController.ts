import { Request, Response } from "express";
import mongoose from "mongoose";
import Notification from "../models/notification";
import Event from "../models/event";
import User from "../models/user";
import Settings from "../models/settings";

/**
 * @desc    Get notifications for the current user
 * @route   GET /api/notifications
 * @access  Private
 */
export const getUserNotifications = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.session?.user?.userId;

    if (!userId) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    // Get user's notifications, sorted by newest first
    const notifications = await Notification.find({ recipient: userId })
      .populate({
        path: "event",
        select: "title date time location organizer",
        populate: {
          path: "organizer",
          select: "username email profileImage",
        },
      })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json(notifications);
  } catch (error: any) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({
      message: "Error fetching notifications",
      error: error.message,
    });
  }
};

/**
 * @desc    Mark notification as read
 * @route   PUT /api/notifications/:id/read
 * @access  Private
 */
export const markNotificationRead = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.session?.user?.userId;

    if (!userId) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    // Check if ID is valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: "Invalid notification ID" });
      return;
    }

    // Find notification and verify ownership
    const notification = await Notification.findById(id);

    if (!notification) {
      res.status(404).json({ message: "Notification not found" });
      return;
    }

    // Verify that the notification belongs to the current user
    if (notification.recipient.toString() !== userId) {
      res.status(403).json({
        message: "Permission denied: This notification does not belong to you",
      });
      return;
    }

    // Mark as read
    notification.isRead = true;
    await notification.save();

    res.status(200).json({ message: "Notification marked as read" });
  } catch (error: any) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({
      message: "Error marking notification as read",
      error: error.message,
    });
  }
};

/**
 * @desc    Mark all notifications as read for the current user
 * @route   PUT /api/notifications/read-all
 * @access  Private
 */
export const markAllNotificationsRead = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.session?.user?.userId;

    if (!userId) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    // Update all unread notifications for this user
    const result = await Notification.updateMany(
      { recipient: userId, isRead: false },
      { isRead: true }
    );

    res.status(200).json({
      message: `Marked ${result.modifiedCount} notifications as read`,
    });
  } catch (error: any) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({
      message: "Error marking all notifications as read",
      error: error.message,
    });
  }
};

/**
 * @desc    Process event reminders and send notifications
 * @route   POST /api/notifications/process-reminders (internal only)
 * @access  Private - Admin only or internal cron job
 */
export const processEventReminders = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userRole = req.session?.user?.role;
    const receivedApiKey = req.headers["x-api-key"];

    // This route should only be accessible via internal cron or admin
    if (
      receivedApiKey !== process.env.INTERNAL_API_KEY &&
      userRole !== "admin" &&
      userRole !== "organizer"
    ) {
      console.warn(
        `[ProcessReminders] Unauthorized access attempt. API Key Match: ${
          receivedApiKey === process.env.INTERNAL_API_KEY
        }, Role: ${userRole}`
      );
      res.status(403).json({ message: "Unauthorized access" });
      return;
    }

    const now = new Date();
    let remindersSent = 0;

    // Get all active events with unsent reminders scheduled before now
    const events = await Event.find({
      isActive: true,
      "reminders.sent": false,
      "reminders.sendAt": { $lte: now },
    }).populate("organizer attendees.user");

    for (const event of events) {
      // Process each unsent reminder
      for (let i = 0; i < event.reminders.length; i++) {
        const reminder = event.reminders[i];

        if (!reminder.sent && new Date(reminder.sendAt) <= now) {
          // Mark reminder as sent
          event.reminders[i].sent = true;

          // Build list of recipients based on reminder type
          let recipients: mongoose.Types.ObjectId[] = [];
          let message = "";

          switch (reminder.type) {
            case "upcoming":
              // Send to all accepted attendees with eventReminders preference
              message = `Reminder: ${event.title} is happening on ${new Date(
                event.date
              ).toLocaleDateString()} at ${event.time}.`;
              recipients = await getAcceptedAttendeesWithReminders(event);
              break;

            case "confirmation":
              // Send to accepted attendees as a confirmation request
              message = `Please confirm your attendance for ${
                event.title
              } on ${new Date(event.date).toLocaleDateString()} at ${
                event.time
              }.`;
              recipients = await getAcceptedAttendeesWithReminders(event);
              break;

            case "no_response":
              // Send to invited attendees who haven't responded
              message = `You've been invited to ${event.title} on ${new Date(
                event.date
              ).toLocaleDateString()} at ${
                event.time
              }. Please respond to the invitation.`;
              recipients = await getNonRespondingAttendees(event);
              break;
          }

          // Create notifications for each recipient
          for (const recipientId of recipients) {
            await Notification.create({
              recipient: recipientId,
              event: event._id,
              type:
                reminder.type === "no_response" ? "no_response" : "reminder",
              message,
            });
            remindersSent++;
          }
        }
      }

      // Save the updated event with marked reminders
      await event.save();
    }

    res.status(200).json({
      message: `Processed reminders for ${events.length} events. Sent ${remindersSent} notifications.`,
    });
  } catch (error: any) {
    console.error("Error processing reminders:", error);
    res.status(500).json({
      message: "Error processing reminders",
      error: error.message,
    });
  }
};

/**
 * @desc    Configure event reminders (for organizers)
 * @route   POST /api/events/:id/reminders
 * @access  Private - Event organizer only
 */
export const configureEventReminders = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { reminders } = req.body;
    const userId = req.session?.user?.userId;

    if (!userId) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: "Invalid event ID" });
      return;
    }

    // Find the event
    const event = await Event.findById(id);

    if (!event) {
      res.status(404).json({ message: "Event not found" });
      return;
    }

    // Check if user is the organizer
    if (event.organizer.toString() !== userId) {
      res.status(403).json({
        message:
          "Permission denied: Only the event organizer can configure reminders",
      });
      return;
    }

    // Validate reminders format
    if (!Array.isArray(reminders)) {
      res.status(400).json({ message: "Reminders must be an array" });
      return;
    }

    // Process and validate each reminder
    const validatedReminders: Array<{
      type: "upcoming" | "confirmation" | "no_response";
      sendAt: Date;
      sent: boolean;
    }> = [];
    const eventDate = new Date(event.date);

    for (const reminder of reminders) {
      // Validate required fields
      if (!reminder.type || !reminder.sendAt) {
        continue; // Skip invalid reminders
      }

      // Validate reminder type
      if (
        !["upcoming", "confirmation", "no_response"].includes(reminder.type)
      ) {
        continue; // Skip invalid type
      }

      // Ensure sendAt is before the event (for upcoming and no_response)
      const sendAtDate = new Date(reminder.sendAt);
      if (
        (reminder.type === "upcoming" || reminder.type === "no_response") &&
        sendAtDate > eventDate
      ) {
        continue; // Skip if scheduled after the event
      }

      // Add validated reminder
      validatedReminders.push({
        type: reminder.type as "upcoming" | "confirmation" | "no_response",
        sendAt: sendAtDate,
        sent: false,
      });
    }

    // Update event with new reminders using findOneAndUpdate
    const updatedEvent = await Event.findOneAndUpdate(
      { _id: id },
      { $set: { reminders: validatedReminders } },
      { new: true }
    );

    res.status(200).json({
      message: "Event reminders configured successfully",
      reminders: updatedEvent?.reminders || [],
    });
  } catch (error: any) {
    console.error("Error configuring event reminders:", error);
    res.status(500).json({
      message: "Error configuring event reminders",
      error: error.message,
    });
  }
};

/**
 * @desc    Send notification for event update
 * @route   POST /api/events/:id/notify-update
 * @access  Private - Event organizer only
 */
export const notifyEventUpdate = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    const userId = req.session?.user?.userId;

    if (!userId) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: "Invalid event ID" });
      return;
    }

    // Find the event
    const event = await Event.findById(id).populate("attendees.user");

    if (!event) {
      res.status(404).json({ message: "Event not found" });
      return;
    }

    // Check if user is the organizer
    if (event.organizer.toString() !== userId) {
      res.status(403).json({
        message:
          "Permission denied: Only the event organizer can send update notifications",
      });
      return;
    }

    // Default message if none provided
    const updateMessage =
      message ||
      `The event "${event.title}" has been updated. Please check the details.`;

    // Get all accepted attendees with update notifications enabled
    const recipients = await getAttendeesWithUpdatePreference(event);
    let notificationsSent = 0;

    // Create update notification for each recipient
    for (const recipientId of recipients) {
      await Notification.create({
        recipient: recipientId,
        event: event._id,
        type: "update",
        message: updateMessage,
      });
      notificationsSent++;
    }

    res.status(200).json({
      message: `Sent update notifications to ${notificationsSent} attendees`,
    });
  } catch (error: any) {
    console.error("Error sending update notifications:", error);
    res.status(500).json({
      message: "Error sending update notifications",
      error: error.message,
    });
  }
};

// Helper functions

// Get all accepted attendees with reminder notifications enabled
async function getAcceptedAttendeesWithReminders(
  event: any
): Promise<mongoose.Types.ObjectId[]> {
  const acceptedAttendeeIds = event.attendees
    .filter((attendee: any) => attendee.status === "accepted")
    .map((attendee: any) => attendee.user._id || attendee.user);

  if (acceptedAttendeeIds.length === 0) return [];

  // Find users with eventReminders preference enabled
  const usersWithReminders = await User.find({
    _id: { $in: acceptedAttendeeIds },
    "notificationPreferences.eventReminders": true,
  }).select("_id");

  return usersWithReminders.map((user: any) => user._id);
}

// Get all attendees who haven't responded
async function getNonRespondingAttendees(
  event: any
): Promise<mongoose.Types.ObjectId[]> {
  return event.attendees
    .filter((attendee: any) => attendee.status === "pending")
    .map(
      (attendee: any) =>
        (attendee.user._id || attendee.user) as mongoose.Types.ObjectId
    );
}

// Get all accepted attendees with update notifications enabled
async function getAttendeesWithUpdatePreference(
  event: any
): Promise<mongoose.Types.ObjectId[]> {
  const acceptedAttendeeIds = event.attendees
    .filter((attendee: any) => attendee.status === "accepted")
    .map((attendee: any) => attendee.user._id || attendee.user);

  if (acceptedAttendeeIds.length === 0) return [];

  // Find users with eventUpdates preference enabled
  const usersWithUpdatePref = await User.find({
    _id: { $in: acceptedAttendeeIds },
    "notificationPreferences.eventUpdates": true,
  }).select("_id");

  return usersWithUpdatePref.map(
    (user: any) => user._id as mongoose.Types.ObjectId
  );
}
