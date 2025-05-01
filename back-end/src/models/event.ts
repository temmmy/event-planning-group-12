/**
 * Event Schema - Stores event details
 */
const EventSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    organizer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      default: "default-event.png",
    },
    visibility: {
      type: String,
      enum: ["public", "private"],
      required: true,
    },
    capacity: {
      type: Number,
      min: 1,
    },
    attendees: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
        status: {
          type: String,
          enum: ["pending", "accepted", "declined"],
          default: "pending",
        },
        invitedAt: {
          type: Date,
          default: Date.now,
        },
        respondedAt: Date,
      },
    ],
    reminders: [
      {
        type: {
          type: String,
          enum: ["upcoming", "confirmation", "no_response"],
          required: true,
        },
        sendAt: {
          type: Date,
          required: true,
        },
        sent: {
          type: Boolean,
          default: false,
        },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
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
