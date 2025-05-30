// RMIT University Vietnam
//   Course: COSC2769 Full Stack Development
//   Semester: 2025A
//   Assessment: Assignment 3
//   Author: GROUP 12
//   Student Name: Nguyen Chi Nghia, Nguyen Bao Hoang, Minh Tran Quang, Hieu Nguyen Minh

/**
 * Statistics Schema - Stores statistics for website and events
 */
const StatisticsSchema = new Schema(
  {
    websiteStats: {
      totalUsers: {
        type: Number,
        default: 0,
      },
      totalEvents: {
        type: Number,
        default: 0,
      },
      totalInvitations: {
        type: Number,
        default: 0,
      },
      activeEvents: {
        type: Number,
        default: 0,
      },
    },
    eventStats: {
      event: {
        type: Schema.Types.ObjectId,
        ref: "Event",
      },
      invitationsSent: {
        type: Number,
        default: 0,
      },
      accepted: {
        type: Number,
        default: 0,
      },
      declined: {
        type: Number,
        default: 0,
      },
      pending: {
        type: Number,
        default: 0,
      },
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);
