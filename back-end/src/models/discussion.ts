import mongoose from "mongoose";
const Schema = mongoose.Schema;

/**
 * Discussion Schema - Stores event discussion board
 */
const DiscussionSchema = new Schema(
  {
    event: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    messages: [
      {
        author: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        content: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
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

// Create and export the Discussion model
const Discussion = mongoose.model("Discussion", DiscussionSchema);

export interface DiscussionDocument extends mongoose.Document {
  event: mongoose.Types.ObjectId;
  messages: {
    _id: mongoose.Types.ObjectId;
    author: mongoose.Types.ObjectId;
    content: string;
    createdAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

export default Discussion;
