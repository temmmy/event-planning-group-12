import { Request, Response } from "express";
import mongoose from "mongoose";
import Event, { EventSchema } from "../models/event";
import User from "../models/user";
import Settings from "../models/settings";
import path from "path";
import fs from "fs";

// Helper to check if user is event organizer
const isOrganizer = async (userId: string, eventId: string) => {
  const event = await Event.findById(eventId);
  return event && event.organizer.toString() === userId;
};

// Helper function to format event response
const formatEventResponse = (req: Request, event: any) => {
  const baseUrl = `${req.protocol}://${req.get("host")}/uploads/events/`;

  // Format organizer data
  const organizer =
    typeof event.organizer === "object"
      ? {
          _id: event.organizer._id,
          name: event.organizer.username || "",
          email: event.organizer.email || "",
          profileImage: event.organizer.profileImage,
        }
      : { _id: event.organizer, name: "", email: "", profileImage: undefined };

  // Format attendees
  const attendees = Array.isArray(event.attendees)
    ? event.attendees
        .map((attendee) => {
          if (typeof attendee.user === "object" && attendee.user) {
            return {
              _id: attendee.user._id,
              name: attendee.user.username || "",
              email: attendee.user.email || "",
              profileImage: attendee.user.profileImage,
            };
          }
          return null;
        })
        .filter(Boolean)
    : [];

  return {
    ...event,
    imageUrl: event.image ? `${baseUrl}${event.image}` : undefined,
    coverImageUrl: event.coverImage
      ? `${baseUrl}${event.coverImage}`
      : undefined,
    organizer,
    attendees,
  };
};

/**
 * @desc    Get all events (with filtering options)
 * @route   GET /api/events
 * @access  Public
 */
export const getEvents = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.session?.user?.userId;
    const userRole = req.session?.user?.role;

    // Parse query parameters
    const { visibility, organizer, search } = req.query;

    // Build filter object
    const filter: any = {};

    // Handle visibility filter
    if (userRole === "admin") {
      // Admins can see all events by default
      if (visibility === "public") {
        filter.visibility = "public";
      } else if (visibility === "private") {
        filter.visibility = "private";
      }
      // If visibility is "all" or not specified, don't add visibility filter for admins
    } else if (visibility === "public") {
      filter.visibility = "public";
    } else if (visibility === "private" && userId) {
      // For private events, user must be organizer or attendee
      filter.$or = [{ organizer: userId }, { "attendees.user": userId }];
    } else if (visibility === "all" && userId) {
      // Show all events the user has access to
      filter.$or = [
        { visibility: "public" },
        { organizer: userId },
        { "attendees.user": userId },
      ];
    } else {
      // Default: show only public events for non-authenticated users
      filter.visibility = "public";
    }

    // Handle organizer filter (when viewing a specific user's events)
    if (organizer) {
      filter.organizer = organizer;
    }

    // Handle search query
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
      ];
    }

    // Filter active events by default
    filter.isActive = true;

    // Find events with filters and populate organizer data
    const events = await Event.find(filter)
      .populate("organizer", "username email profileImage")
      .sort({ date: 1 }) // Sort by upcoming date
      .lean();

    // Transform events to match frontend expected format
    const transformedEvents = events.map((event) =>
      formatEventResponse(req, event)
    );

    res.status(200).json(transformedEvents);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Error fetching events", error: error.message });
  }
};

/**
 * @desc    Get event by ID
 * @route   GET /api/events/:id
 * @access  Public/Private (based on event visibility)
 */
export const getEventById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.session?.user?.userId;
    const userRole = req.session?.user?.role;

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: "Invalid event ID" });
      return;
    }

    // Find event and populate organizer and attendees data
    const event = await Event.findById(id)
      .populate("organizer", "username email profileImage")
      .populate("attendees.user", "username email profileImage")
      .lean();

    // Check if event exists
    if (!event) {
      res.status(404).json({ message: "Event not found" });
      return;
    }

    // Check access to private events
    if (event.visibility === "private") {
      if (!userId) {
        res
          .status(401)
          .json({ message: "Authentication required to view private events" });
        return;
      }

      // Allow access if user is admin or involved in the event
      const isAdmin = userRole === "admin";
      const isUserInvolved =
        event.organizer._id.toString() === userId ||
        event.attendees.some(
          (attendee) => attendee.user?.toString() === userId
        );

      if (!isAdmin && !isUserInvolved) {
        res
          .status(403)
          .json({ message: "You do not have access to this event" });
        return;
      }
    }

    // Transform event to match frontend expected format
    const transformedEvent = formatEventResponse(req, event);

    res.status(200).json(transformedEvent);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Error fetching event", error: error.message });
  }
};

/**
 * @desc    Create a new event
 * @route   POST /api/events
 * @access  Private
 */
export const createEvent = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.session?.user?.userId;

    if (!userId) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    // Get system settings for validation
    const settings = await Settings.findOne();

    if (!settings) {
      res.status(500).json({ message: "System settings not found" });
      return;
    }

    // Check if user has reached their maximum number of active events
    const activeEventsCount = await Event.countDocuments({
      organizer: userId,
      isActive: true,
    });

    if (activeEventsCount >= settings.maxActiveEventsPerUser) {
      res.status(400).json({
        message: `You can only have ${settings.maxActiveEventsPerUser} active events at a time. Please deactivate an existing event before creating a new one.`,
      });
      return;
    }

    const {
      title,
      description,
      date,
      time,
      location,
      visibility = "public",
      capacity,
    } = req.body;

    // Validate required fields
    if (!title || !description || !date || !time || !location) {
      res.status(400).json({ message: "Please provide all required fields" });
      return;
    }

    // Handle file uploads
    let image = "default-event.png";
    let coverImage = "";
    let backgroundColor = req.body.backgroundColor || "";

    if (req.files) {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };

      // Handle profile image upload
      if (files.image && files.image.length > 0) {
        const imageFile = files.image[0];
        const imageFileName = `${userId}-${Date.now()}-${path.basename(
          imageFile.originalname
        )}`;
        const imagePath = path.join(
          __dirname,
          "../../uploads/events",
          imageFileName
        );

        // Ensure directory exists
        const dir = path.dirname(imagePath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }

        fs.writeFileSync(imagePath, imageFile.buffer);
        image = imageFileName;
      }

      // Handle cover image upload
      if (files.coverImage && files.coverImage.length > 0) {
        const coverFile = files.coverImage[0];
        const coverFileName = `cover-${userId}-${Date.now()}-${path.basename(
          coverFile.originalname
        )}`;
        const coverPath = path.join(
          __dirname,
          "../../uploads/events",
          coverFileName
        );

        // Ensure directory exists
        const dir = path.dirname(coverPath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }

        fs.writeFileSync(coverPath, coverFile.buffer);
        coverImage = coverFileName;
      }
    }

    // Create new event
    const newEvent = new Event({
      title,
      description,
      organizer: userId,
      date,
      time,
      location,
      image,
      coverImage: coverImage || undefined,
      backgroundColor: backgroundColor || undefined,
      visibility,
      capacity: capacity || undefined,
      attendees: [], // Start with empty attendees list
      reminders: [
        // Default reminders based on settings
        {
          type: "upcoming",
          sendAt: new Date(
            new Date(date).getTime() -
              settings.defaultReminderTimes.beforeEvent * 60 * 60 * 1000
          ),
          sent: false,
        },
      ],
      isActive: true,
    });

    const savedEvent = await newEvent.save();

    // Add event to user's eventsCreated array
    await User.findByIdAndUpdate(userId, {
      $push: { eventsCreated: savedEvent._id },
    });

    // Populate organizer details before sending response
    const eventWithOrganizer = await Event.findById(savedEvent._id)
      .populate("organizer", "username email profileImage")
      .lean();

    // Transform to match frontend expected format
    const transformedEvent = formatEventResponse(req, eventWithOrganizer);

    res.status(201).json(transformedEvent);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Error creating event", error: error.message });
  }
};

/**
 * @desc    Update an event
 * @route   PUT /api/events/:id
 * @access  Private (organizer only)
 */
export const updateEvent = async (
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

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: "Invalid event ID" });
      return;
    }

    // Check if user is the organizer
    const isEventOrganizer = await isOrganizer(userId, id);

    if (!isEventOrganizer) {
      res
        .status(403)
        .json({ message: "Only the event organizer can update this event" });
      return;
    }

    const {
      title,
      description,
      date,
      time,
      location,
      visibility,
      capacity,
      isActive,
    } = req.body;

    // Build update object with provided fields
    const updateData: any = {};

    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (date) updateData.date = date;
    if (time) updateData.time = time;
    if (location) updateData.location = location;
    if (visibility) updateData.visibility = visibility;
    if (capacity !== undefined) updateData.capacity = capacity;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (req.body.backgroundColor)
      updateData.backgroundColor = req.body.backgroundColor;

    // Handle file uploads
    if (req.files) {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };

      // Handle event image upload
      if (files.image && files.image.length > 0) {
        const imageFile = files.image[0];
        const imageFileName = `${userId}-${Date.now()}-${path.basename(
          imageFile.originalname
        )}`;
        const imagePath = path.join(
          __dirname,
          "../../uploads/events",
          imageFileName
        );

        // Ensure directory exists
        const dir = path.dirname(imagePath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }

        fs.writeFileSync(imagePath, imageFile.buffer);
        updateData.image = imageFileName;

        // Delete old image if it's not the default
        const oldEvent = await Event.findById(id);
        if (oldEvent?.image && oldEvent.image !== "default-event.png") {
          const oldImagePath = path.join(
            __dirname,
            "../../uploads/events",
            oldEvent.image
          );
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }
      }

      // Handle cover image upload
      if (files.coverImage && files.coverImage.length > 0) {
        const coverFile = files.coverImage[0];
        const coverFileName = `cover-${userId}-${Date.now()}-${path.basename(
          coverFile.originalname
        )}`;
        const coverPath = path.join(
          __dirname,
          "../../uploads/events",
          coverFileName
        );

        // Ensure directory exists
        const dir = path.dirname(coverPath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }

        fs.writeFileSync(coverPath, coverFile.buffer);
        updateData.coverImage = coverFileName;

        // Delete old cover image if it exists
        const oldEvent = await Event.findById(id);
        if (oldEvent?.coverImage) {
          const oldCoverPath = path.join(
            __dirname,
            "../../uploads/events",
            oldEvent.coverImage
          );
          if (fs.existsSync(oldCoverPath)) {
            fs.unlinkSync(oldCoverPath);
          }
        }
      }
    }

    // Update event timestamps
    updateData.updatedAt = new Date();

    // Find and update event
    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true } // Return the updated document
    )
      .populate("organizer", "username email profileImage")
      .populate("attendees.user", "username email profileImage")
      .lean();

    // Check if event exists
    if (!updatedEvent) {
      res.status(404).json({ message: "Event not found" });
      return;
    }

    // Transform to match frontend expected format
    const transformedEvent = formatEventResponse(req, updatedEvent);

    res.status(200).json(transformedEvent);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Error updating event", error: error.message });
  }
};

/**
 * @desc    Delete an event
 * @route   DELETE /api/events/:id
 * @access  Private (Admin or Organizer only)
 */
export const deleteEvent = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.session?.user?.userId;
    const userRole = req.session?.user?.role;

    if (!userId) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: "Invalid event ID" });
      return;
    }

    // Find event
    const event = await Event.findById(id);

    // Check if event exists
    if (!event) {
      res.status(404).json({ message: "Event not found" });
      return;
    }

    // Check if user is admin or the organizer of the event
    const isAdmin = userRole === "admin";
    const isEventOrganizer = event.organizer.toString() === userId;

    if (!isAdmin && !isEventOrganizer) {
      res.status(403).json({
        message:
          "Permission denied: You must be an admin or the event organizer to delete this event",
      });
      return;
    }

    // Delete all related images
    if (event.image && event.image !== "default-event.png") {
      const imagePath = path.join(
        __dirname,
        "../../uploads/events",
        event.image
      );
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    if (event.coverImage) {
      const coverPath = path.join(
        __dirname,
        "../../uploads/events",
        event.coverImage
      );
      if (fs.existsSync(coverPath)) {
        fs.unlinkSync(coverPath);
      }
    }

    // Delete the event
    await Event.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Error deleting event", error: error.message });
  }
};

/**
 * @desc    Invite users to event
 * @route   POST /api/events/:id/invite
 * @access  Private - Event organizer or admin can invite users
 */
export const inviteToEvent = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { emails } = req.body;
    const userId = req.session?.user?.userId;
    const userRole = req.session?.user?.role;

    if (!userId) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

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

    // Check if user is admin or the organizer
    const isAdmin = userRole === "admin";
    const isOrganizer = event.organizer.toString() === userId;

    if (!isAdmin && !isOrganizer) {
      res.status(403).json({
        message:
          "Permission denied: Only the event organizer or admin can invite users",
      });
      return;
    }

    // Find users by email
    const foundUsers = await User.find({ email: { $in: emails } }).lean();

    // Collect emails that don't match any user
    const notFoundEmails = emails.filter(
      (email) =>
        !foundUsers.some(
          (user) =>
            user.email && user.email.toLowerCase() === email.toLowerCase()
        )
    );

    // Get current attendee IDs for comparison
    const currentAttendeeIds = event.attendees
      .map((attendee) => (attendee._id ? attendee._id.toString() : ""))
      .filter((id) => id);

    let newlyAddedUsers = 0;

    // Add each found user to attendees if not already there
    for (const user of foundUsers) {
      if (!user._id) continue;

      const userIdStr = user._id.toString();

      // Skip if user is already in attendees
      if (currentAttendeeIds.includes(userIdStr)) {
        continue;
      }

      // Create new attendee entry with the proper fields
      const attendeeData = {
        _id: user._id,
        name: user.username || "",
        email: user.email || "",
        profileImage: user.profileImage,
      };

      // Add to event attendees
      event.attendees.push(attendeeData as any);
      newlyAddedUsers++;
    }

    // Save the event if any users were added
    if (newlyAddedUsers > 0) {
      await event.save();
    }

    // Get updated event with populated fields
    const updatedEvent = await Event.findById(id)
      .populate("organizer")
      .populate("attendees")
      .lean();

    // Transform to match frontend expected format
    const transformedEvent = formatEventResponse(req, updatedEvent);

    res.status(200).json({
      message: `Invited ${newlyAddedUsers} user(s) to the event`,
      notFound: notFoundEmails.length > 0 ? notFoundEmails : null,
      event: transformedEvent,
    });
  } catch (error) {
    console.error("Error inviting users to event:", error);
    res.status(500).json({ message: "Server error while inviting users" });
  }
};

/**
 * @desc    Respond to an event invitation
 * @route   PUT /api/events/:id/respond
 * @access  Private
 */
export const respondToInvitation = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;
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

    // Validate status
    if (!status || !["accepted", "declined"].includes(status)) {
      res.status(400).json({
        message: "Please provide a valid status (accepted or declined)",
      });
      return;
    }

    // Find event
    const event = await Event.findById(id);

    if (!event) {
      res.status(404).json({ message: "Event not found" });
      return;
    }

    // Check if user is invited
    const attendeeIndex = event.attendees.findIndex(
      (attendee) => attendee.user?.toString() === userId
    );

    if (attendeeIndex === -1) {
      res.status(404).json({ message: "You are not invited to this event" });
      return;
    }

    // Update attendee status
    event.attendees[attendeeIndex].status = status;
    event.attendees[attendeeIndex].respondedAt = new Date();

    await event.save();

    // If accepted, add event to user's attending list
    if (status === "accepted") {
      await User.findByIdAndUpdate(userId, {
        $addToSet: { eventsAttending: id },
      });
    }

    // Return updated event
    const updatedEvent = await Event.findById(id)
      .populate("organizer", "username email profileImage")
      .populate("attendees.user", "username email profileImage")
      .lean();

    res.status(200).json(updatedEvent);
  } catch (error: any) {
    res.status(500).json({
      message: "Error responding to invitation",
      error: error.message,
    });
  }
};

/**
 * @desc    Get event statistics for admins
 * @route   GET /api/events/statistics
 * @access  Private - Admin only
 */
export const getEventStatistics = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.session?.user?.userId;
    const userRole = req.session?.user?.role;

    if (!userId) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    // Check if user is admin
    if (userRole !== "admin") {
      res.status(403).json({
        message: "Access denied. Admin privileges required.",
      });
      return;
    }

    // Get count of all events
    const totalEvents = await Event.countDocuments();

    // Get count of public events
    const publicEvents = await Event.countDocuments({
      visibility: "public",
    });

    // Get count of private events
    const privateEvents = await Event.countDocuments({
      visibility: "private",
    });

    // Get events grouped by month
    const eventsByMonth = await Event.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    // Get top organizers
    const topOrganizers = await Event.aggregate([
      {
        $group: {
          _id: "$organizer",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "organizer",
        },
      },
      {
        $project: {
          _id: 0,
          organizer: { $arrayElemAt: ["$organizer", 0] },
          count: 1,
        },
      },
      {
        $project: {
          "organizer._id": 1,
          "organizer.username": 1,
          "organizer.email": 1,
          count: 1,
        },
      },
    ]);

    // Get upcoming events count
    const upcomingEvents = await Event.countDocuments({
      date: { $gte: new Date() },
      isActive: true,
    });

    // Get past events count
    const pastEvents = await Event.countDocuments({
      date: { $lt: new Date() },
    });

    // Get average attendees per event
    const averageAttendees = await Event.aggregate([
      {
        $group: {
          _id: null,
          averageAttendees: { $avg: { $size: "$attendees" } },
        },
      },
    ]);

    // Get events with most attendees
    const mostPopularEvents = await Event.aggregate([
      {
        $project: {
          title: 1,
          date: 1,
          organizer: 1,
          attendeeCount: { $size: "$attendees" },
        },
      },
      { $sort: { attendeeCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "users",
          localField: "organizer",
          foreignField: "_id",
          as: "organizer",
        },
      },
      {
        $project: {
          _id: 1,
          title: 1,
          date: 1,
          attendeeCount: 1,
          organizer: { $arrayElemAt: ["$organizer", 0] },
        },
      },
      {
        $project: {
          _id: 1,
          title: 1,
          date: 1,
          attendeeCount: 1,
          "organizer._id": 1,
          "organizer.username": 1,
        },
      },
    ]);

    // Return statistics
    res.status(200).json({
      totalEvents,
      publicEvents,
      privateEvents,
      eventsByMonth,
      topOrganizers,
      upcomingEvents,
      pastEvents,
      averageAttendees:
        averageAttendees.length > 0 ? averageAttendees[0].averageAttendees : 0,
      mostPopularEvents,
    });
  } catch (error: any) {
    console.error("Error fetching event statistics:", error);
    res.status(500).json({
      message: "Server error while fetching event statistics",
      error: error.message,
    });
  }
};
