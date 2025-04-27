import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables from .env file

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error(
    "Error: MONGODB_URI is not defined in the environment variables."
  );
  process.exit(1); // Exit if MongoDB URI is not set
}

const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("MongoDB Connected successfully.");
  } catch (err: any) {
    console.error("MongoDB connection error:", err.message);
    // Exit process with failure code
    process.exit(1);
  }
};

export default connectDB;
