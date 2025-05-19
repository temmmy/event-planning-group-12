// RMIT University Vietnam
//   Course: COSC2769 Full Stack Development
//   Semester: 2025A
//   Assessment: Assignment 3
//   Author: GROUP 12
//   Student Name: Nguyen Chi Nghia, Nguyen Bao Hoang, Minh Tran Quang, Hieu Nguyen Minh

import mongoose from "mongoose";
const { Schema } = mongoose;
/**
 * Notification Schema - Stores notifications for reminders and updates
 */
const NotificationSchema = new Schema(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    event: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    type: {
      type: String,
      enum: ["invitation", "reminder", "update", "no_response"],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Define interface for Notification document
export interface INotification extends mongoose.Document {
  recipient: mongoose.Types.ObjectId;
  event: mongoose.Types.ObjectId;
  type: "invitation" | "reminder" | "update" | "no_response";
  message: string;
  isRead: boolean;
  createdAt: Date;
}

// Create and export the Notification model
export default mongoose.model<INotification>(
  "Notification",
  NotificationSchema
);
