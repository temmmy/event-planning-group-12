// RMIT University Vietnam
//   Course: COSC2769 Full Stack Development
//   Semester: 2025A
//   Assessment: Assignment 3
//   Author: GROUP 12
//   Student Name: Nguyen Chi Nghia, Nguyen Bao Hoang, Minh Tran Quang, Hieu Nguyen Minh

import mongoose, { Schema, Document } from "mongoose";

/**
 * Interface for the Settings document
 */
export interface ISettings extends Document {
  maxActiveEventsPerUser: number;
  maxInvitationsPerEvent: number;
  maxFileUploadSize: number;
  allowedFileTypes: string[];
  defaultReminderTimes: {
    beforeEvent: number;
    forNonResponders: number;
  };
  updatedBy?: mongoose.Types.ObjectId;
  updatedAt?: Date;
}

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
    defaultReminderTimes: {
      beforeEvent: {
        type: Number,
        default: 24, // 24 hours before event
      },
      forNonResponders: {
        type: Number,
        default: 48, // 48 hours after invitation if no response
      },
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

// Create and export the Settings model
export default mongoose.model<ISettings>("Settings", SystemSettingsSchema);
