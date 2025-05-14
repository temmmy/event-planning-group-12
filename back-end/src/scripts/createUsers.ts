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

// Define user types
type UserRole = "admin" | "organizer" | "attendee";
type UserCredentials = {
  username: string;
  email: string;
  password: string;
  role: UserRole;
  profileImage?: string;
  notificationPreferences?: {
    eventReminders: boolean;
    eventUpdates: boolean;
  };
};

// Users to create - customize this array as needed
const usersToCreate: UserCredentials[] = [
  {
    username: "admin2",
    email: "admin2@example.com",
    password: "admin123",
    role: "admin",
  },
  {
    username: "organizer1",
    email: "organizer1@example.com",
    password: "organizer123",
    role: "organizer",
    profileImage: "default-profile.png",
  },
  {
    username: "organizer2",
    email: "organizer2@example.com",
    password: "organizer123",
    role: "organizer",
    profileImage: "default-profile.png",
  },
  {
    username: "attendee1",
    email: "attendee1@example.com",
    password: "attendee123",
    role: "attendee",
    notificationPreferences: {
      eventReminders: true,
      eventUpdates: true,
    },
  },
  {
    username: "attendee2",
    email: "attendee2@example.com",
    password: "attendee123",
    role: "attendee",
    notificationPreferences: {
      eventReminders: false,
      eventUpdates: true,
    },
  },
];

// Function to create a single user
async function createUser(userCredentials: UserCredentials) {
  try {
    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { email: userCredentials.email },
        { username: userCredentials.username },
      ],
    });

    if (existingUser) {
      console.log(
        `User ${userCredentials.username} already exists with this email or username.`
      );

      // Update user properties if needed
      let updated = false;

      if (existingUser.role !== userCredentials.role) {
        existingUser.role = userCredentials.role;
        updated = true;
      }

      if (
        userCredentials.notificationPreferences &&
        existingUser.notificationPreferences
      ) {
        existingUser.notificationPreferences =
          userCredentials.notificationPreferences;
        updated = true;
      }

      if (updated) {
        await existingUser.save();
        console.log(
          `Updated existing user ${userCredentials.username} to ${userCredentials.role} role.`
        );
      } else {
        console.log(`No changes needed for user ${userCredentials.username}.`);
      }

      return false;
    } else {
      // Create new user
      const newUser = new User(userCredentials);
      await newUser.save();
      console.log(
        `Created new ${userCredentials.role} user: ${userCredentials.username}`
      );
      console.log("  Username:", userCredentials.username);
      console.log("  Email:", userCredentials.email);
      console.log("  Password:", userCredentials.password);
      return true;
    }
  } catch (error) {
    console.error(
      `Error creating/updating user ${userCredentials.username}:`,
      error
    );
    return false;
  }
}

// Function to create all users
async function createUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(mongoUri as string);
    console.log("Connected to MongoDB");

    // Create users sequentially
    let created = 0;
    let existing = 0;

    for (const userData of usersToCreate) {
      const isNew = await createUser(userData);
      if (isNew) {
        created++;
      } else {
        existing++;
      }
    }

    console.log("\nSummary:");
    console.log(`- New users created: ${created}`);
    console.log(`- Existing users found: ${existing}`);
    console.log(`- Total users processed: ${usersToCreate.length}`);
  } catch (error) {
    console.error("Error in user creation process:", error);
  } finally {
    // Close the database connection
    await mongoose.connection.close();
    console.log("Database connection closed");
  }
}

// Run the function
createUsers();
