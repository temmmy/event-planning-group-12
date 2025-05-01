/**
 * System Settings Schema - Stores admin configurable settings
 */
const SystemSettingsSchema = new Schema(
  {
    maxActiveEventsPerUser: {
      type: Number,
      default: 5,
      min: 1,
    },
    maxInvitationsPerEvent: {
      type: Number,
      default: 50,
      min: 1,
    },
    maxFileUploadSize: {
      type: Number,
      default: 5 * 1024 * 1024, // 5MB in bytes
    },
    allowedFileTypes: {
      type: [String],
      default: ["image/jpeg", "image/png", "image/gif"],
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);
