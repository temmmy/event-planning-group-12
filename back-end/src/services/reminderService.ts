// RMIT University Vietnam
//   Course: COSC2769 Full Stack Development
//   Semester: 2025A
//   Assessment: Assignment 3
//   Author: GROUP 12
//   Student Name: Nguyen Chi Nghia, Nguyen Bao Hoang, Minh Tran Quang, Hieu Nguyen Minh

import axios from "axios";
import cron from "node-cron";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Default API URL pointing to the local server
const API_URL = process.env.API_URL || "http://localhost:5001";
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY || "";

/**
 * Process reminders by calling the notification controller endpoint
 */
export const processReminders = async (): Promise<void> => {
  try {
    // Make an internal API call to the notification controller
    const response = await axios.post(
      `${API_URL}/api/notifications/process-reminders`,
      {},
      {
        headers: {
          "x-api-key": INTERNAL_API_KEY,
        },
      }
    );

    console.log(`[ReminderService] ${response.data.message}`);
  } catch (error: any) {
    console.error(
      "[ReminderService] Error processing reminders:",
      error.message
    );

    // Log more details if available
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error("Data:", error.response.data);
    }
  }
};

/**
 * Initialize the reminder scheduler
 */
export const initReminderScheduler = (): void => {
  if (!INTERNAL_API_KEY) {
    console.warn(
      "[ReminderService] INTERNAL_API_KEY not set. Reminder service will not work properly."
    );
  }

  // Schedule to run every 5 minutes
  // Cron format: minute hour day-of-month month day-of-week
  cron.schedule("*/1 * * * *", async () => {
    console.log("[ReminderService] Running scheduled reminder check...");
    await processReminders();
  });

  console.log("[ReminderService] Reminder scheduler initialized");
};

// Optional: Export a function to run the reminder process manually (for testing)
export const runReminderManually = async (): Promise<void> => {
  console.log("[ReminderService] Running manual reminder check...");
  await processReminders();
};
