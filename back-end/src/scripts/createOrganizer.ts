// RMIT University Vietnam
//   Course: COSC2769 Full Stack Development
//   Semester: 2025A
//   Assessment: Assignment 3
//   Author: GROUP 12
//   Student Name: Nguyen Chi Nghia, Nguyen Bao Hoang, Minh Tran Quang, Hieu Nguyen Minh

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

// Organizer credentials to create
const organizerCredentials = {
  username: "organizer",
  email: "organizer@example.com",
  password: "organizer123",
  role: "organizer" as const,
  profileImage: "default-profile.png", // Default profile image
};

// Function to create organizer
async function createOrganizer() {
  try {
    // Connect to MongoDB - mongoUri is guaranteed to be string due to the check above
    await mongoose.connect(mongoUri as string);
    console.log("Connected to MongoDB");

    // Check if organizer already exists
    const existingUser = await User.findOne({
      $or: [
        { email: organizerCredentials.email },
        { username: organizerCredentials.username },
      ],
    });

    if (existingUser) {
      console.log("Organizer user already exists with this email or username.");

      // If needed, update the existing user to be an organizer
      if (existingUser.role !== "organizer") {
        existingUser.role = "organizer";
        await existingUser.save();
        console.log("Existing user updated to organizer role.");
      } else {
        console.log("User already has organizer role. No changes made.");
      }
    } else {
      // Create new organizer user
      const newOrganizer = new User(organizerCredentials);
      await newOrganizer.save();
      console.log("Organizer user created successfully!");
      console.log("Username:", organizerCredentials.username);
      console.log("Email:", organizerCredentials.email);
      console.log("Password:", organizerCredentials.password);
    }
  } catch (error) {
    console.error("Error creating organizer user:", error);
  } finally {
    // Close the database connection
    await mongoose.connection.close();
    console.log("Database connection closed");
  }
}

// Run the function
createOrganizer();
