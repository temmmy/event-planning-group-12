/**
 * User Schema - Stores user information and authentication details
 */
import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcrypt"; // Import bcrypt

// Define the interface for the User document
export interface IUser extends Document {
  username: string;
  email: string;
  password: string; // This will store the hashed password
  role: "admin" | "organizer" | "attendee";
  profileImage?: string; // Make optional if using default
  eventsCreated?: mongoose.Types.ObjectId[];
  eventsAttending?: mongoose.Types.ObjectId[];
  invitations?: mongoose.Types.ObjectId[];
  notificationPreferences?: {
    eventReminders: boolean;
    eventUpdates: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>; // Method to compare passwords
}

const UserSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "organizer", "attendee"],
      default: "attendee",
    },
    profileImage: {
      type: String,
      default: "default-profile.png",
    },
    eventsCreated: [
      {
        type: Schema.Types.ObjectId,
        ref: "Event",
      },
    ],
    eventsAttending: [
      {
        type: Schema.Types.ObjectId,
        ref: "Event",
      },
    ],
    invitations: [
      {
        type: Schema.Types.ObjectId,
        ref: "Invitation",
      },
    ],
    notificationPreferences: {
      eventReminders: { type: Boolean, default: true },
      eventUpdates: { type: Boolean, default: true },
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Password Hashing Middleware (Before saving)
UserSchema.pre<IUser>("save", async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10); // Generate salt (10 rounds is standard)
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Method to compare candidate password with the stored hash
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>("User", UserSchema);
