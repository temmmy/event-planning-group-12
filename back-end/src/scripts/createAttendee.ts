import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/user";

// Load environment variables
dotenv.config();

// DB Connection URI
const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  console.error("FATAL ERROR: MONGODB_URI is not defined.");
  process.exit(1);
}

// Attendee credentials to create
const attendeeCredentials = {
  username: "attendee",
  email: "attendee@example.com",
  password: "attendee123",
  role: "attendee" as const,
  profileImage: "default-profile.png", // Default profile image
  notificationPreferences: {
    eventReminders: true,
    eventUpdates: true,
  },
};

// Function to create attendee
async function createAttendee() {
  try {
    // Connect to MongoDB - mongoUri is guaranteed to be string due to the check above
    await mongoose.connect(mongoUri as string);
    console.log("Connected to MongoDB");

    // Check if attendee already exists
    const existingUser = await User.findOne({
      $or: [
        { email: attendeeCredentials.email },
        { username: attendeeCredentials.username },
      ],
    });

    if (existingUser) {
      console.log("Attendee user already exists with this email or username.");

      // Update notification preferences if needed
      existingUser.notificationPreferences =
        attendeeCredentials.notificationPreferences;

      // If needed, update the existing user to be an attendee
      if (existingUser.role !== "attendee") {
        existingUser.role = "attendee";
        await existingUser.save();
        console.log("Existing user updated to attendee role.");
      } else {
        console.log(
          "User already has attendee role. Updated notification preferences."
        );
      }
    } else {
      // Create new attendee user
      const newAttendee = new User(attendeeCredentials);
      await newAttendee.save();
      console.log("Attendee user created successfully!");
      console.log("Username:", attendeeCredentials.username);
      console.log("Email:", attendeeCredentials.email);
      console.log("Password:", attendeeCredentials.password);
    }
  } catch (error) {
    console.error("Error creating attendee user:", error);
  } finally {
    // Close the database connection
    await mongoose.connection.close();
    console.log("Database connection closed");
  }
}

// Run the function
createAttendee();
