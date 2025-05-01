/**
 * User Schema - Stores user information and authentication details
 */
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
