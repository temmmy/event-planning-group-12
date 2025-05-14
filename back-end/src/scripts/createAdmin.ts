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

// Admin credentials to create
const adminCredentials = {
  username: "admin",
  email: "s3979170@rmit.edu.vn",
  password: "bog132435",
  role: "admin" as const,
};

// Function to create admin
async function createAdmin() {
  try {
    // Connect to MongoDB - mongoUri is guaranteed to be string due to the check above
    await mongoose.connect(mongoUri as string);
    console.log("Connected to MongoDB");

    // Check if admin already exists
    const existingUser = await User.findOne({
      $or: [
        { email: adminCredentials.email },
        { username: adminCredentials.username },
      ],
    });

    if (existingUser) {
      console.log("Admin user already exists with this email or username.");

      // If needed, update the existing user to be an admin
      if (existingUser.role !== "admin") {
        existingUser.role = "admin";
        await existingUser.save();
        console.log("Existing user updated to admin role.");
      }
    } else {
      // Create new admin user
      const newAdmin = new User(adminCredentials);
      await newAdmin.save();
      console.log("Admin user created successfully!");
    }
  } catch (error) {
    console.error("Error creating admin user:", error);
  } finally {
    // Close the database connection
    await mongoose.connection.close();
    console.log("Database connection closed");
  }
}

// Run the function
createAdmin();
