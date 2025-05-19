// RMIT University Vietnam
//   Course: COSC2769 Full Stack Development
//   Semester: 2025A
//   Assessment: Assignment 3
//   Author: GROUP 12
//   Student Name: Nguyen Chi Nghia, Nguyen Bao Hoang, Minh Tran Quang, Hieu Nguyen Minh

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../store";
import * as settingsService from "../../services/settingsService";

// Define types
export interface DefaultReminderTimes {
  beforeEvent: number; // Hours before event
  forNonResponders: number; // Hours before sending reminder to non-responders
}

export interface SystemSettings {
  _id: string;
  maxActiveEventsPerUser: number;
  maxInvitationsPerEvent: number;
  maxFileUploadSize: number; // in MB
  allowedFileTypes: string[];
  defaultReminderTimes: DefaultReminderTimes;
  updatedBy?: string;
  updatedAt?: Date;
}

interface SettingsState {
  data: SystemSettings | null;
  loading: "idle" | "pending" | "succeeded" | "failed";
  error: string | null;
}

const initialState: SettingsState = {
  data: null,
  loading: "idle",
  error: null,
};

// Async thunks for API calls
export const fetchSettings = createAsyncThunk(
  "settings/fetchSettings",
  async (_, { rejectWithValue }) => {
    try {
      const response = await settingsService.getSettings();
      return response.settings;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to fetch settings");
    }
  }
);

export const updateSettings = createAsyncThunk(
  "settings/updateSettings",
  async (settingsData: Partial<SystemSettings>, { rejectWithValue }) => {
    try {
      const response = await settingsService.updateSettings(settingsData);
      return response.settings;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to update settings");
    }
  }
);

// Create the settings slice
const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    resetSettingsState: (state) => {
      state.loading = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch settings cases
      .addCase(fetchSettings.pending, (state) => {
        state.loading = "pending";
        state.error = null;
      })
      .addCase(
        fetchSettings.fulfilled,
        (state, action: PayloadAction<SystemSettings>) => {
          state.loading = "succeeded";
          state.data = action.payload;
        }
      )
      .addCase(fetchSettings.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.payload as string;
      })

      // Update settings cases
      .addCase(updateSettings.pending, (state) => {
        state.loading = "pending";
        state.error = null;
      })
      .addCase(
        updateSettings.fulfilled,
        (state, action: PayloadAction<SystemSettings>) => {
          state.loading = "succeeded";
          state.data = action.payload;
        }
      )
      .addCase(updateSettings.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.payload as string;
      });
  },
});

export const { resetSettingsState } = settingsSlice.actions;

// Selectors
export const selectSettings = (state: RootState) => state.settings.data;
export const selectSettingsLoading = (state: RootState) =>
  state.settings.loading;
export const selectSettingsError = (state: RootState) => state.settings.error;

export default settingsSlice.reducer;
