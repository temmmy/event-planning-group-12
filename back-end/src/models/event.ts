// RMIT University Vietnam
//   Course: COSC2769 Full Stack Development
//   Semester: 2025A
//   Assessment: Assignment 3
//   Author: GROUP 12
//   Student Name: Nguyen Chi Nghia, Nguyen Bao Hoang, Minh Tran Quang, Hieu Nguyen Minh

import mongoose from "mongoose";
const { Schema } = mongoose;

/**
 * Event Schema - Stores event details
 */
export const EventSchema = new Schema(
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
    coverImage: {
      type: String,
    },
    backgroundColor: {
      type: String,
      default: "#eceff4", // Nord6 color by default
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
          enum: ["pending", "accepted", "declined", "requested"],
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

// Create and export the Event model
const Event = mongoose.model("Event", EventSchema);
export default Event;
