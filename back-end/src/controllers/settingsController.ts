// RMIT University Vietnam
//   Course: COSC2769 Full Stack Development
//   Semester: 2025A
//   Assessment: Assignment 3
//   Author: GROUP 12
//   Student Name: Nguyen Chi Nghia, Nguyen Bao Hoang, Minh Tran Quang, Hieu Nguyen Minh

import { Request, Response } from "express";
import mongoose from "mongoose";
import Settings, { ISettings } from "../models/settings";

/**
 * Get current system settings
 * @route GET /api/settings
 * @access Private (Admin only)
 */
export const getSettings = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Try to find existing settings or get the first (and only) settings document
    let settings = await Settings.findOne();

    // If no settings document exists yet, create default settings
    if (!settings) {
      const newSettings = new Settings();
      settings = await newSettings.save();
    }

    res.status(200).json(settings);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Error fetching settings", error: error.message });
  }
};

/**
 * Update system settings
 * @route PUT /api/settings
 * @access Private (Admin only)
 */
export const updateSettings = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Using userId property which is set during login in authController
    const userId = req.session?.user?.userId;

    console.log("Session user data:", req.session?.user);

    if (!userId) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    // Validate the incoming data
    const {
      maxActiveEventsPerUser,
      maxInvitationsPerEvent,
      maxFileUploadSize,
      allowedFileTypes,
      defaultReminderTimes,
    } = req.body;

    // Find existing settings or create new ones
    let settings = await Settings.findOne();

    if (!settings) {
      settings = new Settings();
    }

    // Update the settings with new values
    if (maxActiveEventsPerUser !== undefined) {
      if (maxActiveEventsPerUser < 1) {
        res
          .status(400)
          .json({ message: "maxActiveEventsPerUser must be at least 1" });
        return;
      }
      settings.maxActiveEventsPerUser = maxActiveEventsPerUser;
    }

    if (maxInvitationsPerEvent !== undefined) {
      if (maxInvitationsPerEvent < 1) {
        res
          .status(400)
          .json({ message: "maxInvitationsPerEvent must be at least 1" });
        return;
      }
      settings.maxInvitationsPerEvent = maxInvitationsPerEvent;
    }

    if (maxFileUploadSize !== undefined) {
      settings.maxFileUploadSize = maxFileUploadSize;
    }

    if (allowedFileTypes !== undefined && Array.isArray(allowedFileTypes)) {
      settings.allowedFileTypes = allowedFileTypes;
    }

    if (defaultReminderTimes) {
      if (defaultReminderTimes.beforeEvent !== undefined) {
        settings.defaultReminderTimes.beforeEvent =
          defaultReminderTimes.beforeEvent;
      }
      if (defaultReminderTimes.forNonResponders !== undefined) {
        settings.defaultReminderTimes.forNonResponders =
          defaultReminderTimes.forNonResponders;
      }
    }

    // Update metadata - convert string ID to ObjectId
    settings.updatedBy = new mongoose.Types.ObjectId(userId);
    settings.updatedAt = new Date();

    // Save the updated settings
    await settings.save();

    res.status(200).json(settings);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Error updating settings", error: error.message });
  }
};
