/**
 * Invitation Schema - Stores invitations sent to users
 */
const InvitationSchema = new Schema(
  {
    event: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "declined"],
      default: "pending",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    respondedAt: Date,
  },
  { timestamps: true }
);
