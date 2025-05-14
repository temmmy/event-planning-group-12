import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
<<<<<<< HEAD
import * as settingsService from "../services/settingsService";
import type { RootState } from "../../store";

// Define the types for settings
export interface SystemSettings {
  maxEventsPerUser: number;
  maxInvitationsPerEvent: number;
  maxActiveEvents: number;
  allowPublicEvents: boolean;
  allowPrivateEvents: boolean;
  defaultEventVisibility: "public" | "private";
  reminderTimeOptions: number[];
}

interface SettingsState {
  systemSettings: SystemSettings;
=======
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
>>>>>>> c59748663a538165bb6fb232a4bf718ff709930d
  loading: "idle" | "pending" | "succeeded" | "failed";
  error: string | null;
}

const initialState: SettingsState = {
<<<<<<< HEAD
  systemSettings: {
    maxEventsPerUser: 10,
    maxInvitationsPerEvent: 50,
    maxActiveEvents: 5,
    allowPublicEvents: true,
    allowPrivateEvents: true,
    defaultEventVisibility: "public",
    reminderTimeOptions: [15, 30, 60, 1440],
  },
=======
  data: null,
>>>>>>> c59748663a538165bb6fb232a4bf718ff709930d
  loading: "idle",
  error: null,
};

<<<<<<< HEAD
// Thunk to fetch system settings
export const fetchSystemSettings = createAsyncThunk(
  "settings/fetchSystemSettings",
  async (_, { rejectWithValue }) => {
    try {
      const response = await settingsService.getSystemSettings();
      return response as SystemSettings;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch settings");
=======
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
>>>>>>> c59748663a538165bb6fb232a4bf718ff709930d
    }
  }
);

<<<<<<< HEAD
// Thunk to update system settings
export const updateSystemSettings = createAsyncThunk(
  "settings/updateSystemSettings",
  async (settings: SystemSettings, { rejectWithValue }) => {
    try {
      const response = await settingsService.updateSystemSettings(settings);
      return response as SystemSettings;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to update settings");
=======
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
>>>>>>> c59748663a538165bb6fb232a4bf718ff709930d
    }
  }
);

<<<<<<< HEAD
export const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    clearSettingsError: (state) => {
=======
// Create the settings slice
const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    resetSettingsState: (state) => {
      state.loading = "idle";
>>>>>>> c59748663a538165bb6fb232a4bf718ff709930d
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
<<<<<<< HEAD
      // Fetch Settings
      .addCase(fetchSystemSettings.pending, (state) => {
=======
      // Fetch settings cases
      .addCase(fetchSettings.pending, (state) => {
>>>>>>> c59748663a538165bb6fb232a4bf718ff709930d
        state.loading = "pending";
        state.error = null;
      })
      .addCase(
<<<<<<< HEAD
        fetchSystemSettings.fulfilled,
        (state, action: PayloadAction<SystemSettings>) => {
          state.loading = "succeeded";
          state.systemSettings = action.payload;
        }
      )
      .addCase(fetchSystemSettings.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.payload as string;
      })
      // Update Settings
      .addCase(updateSystemSettings.pending, (state) => {
=======
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
>>>>>>> c59748663a538165bb6fb232a4bf718ff709930d
        state.loading = "pending";
        state.error = null;
      })
      .addCase(
<<<<<<< HEAD
        updateSystemSettings.fulfilled,
        (state, action: PayloadAction<SystemSettings>) => {
          state.loading = "succeeded";
          state.systemSettings = action.payload;
        }
      )
      .addCase(updateSystemSettings.rejected, (state, action) => {
=======
        updateSettings.fulfilled,
        (state, action: PayloadAction<SystemSettings>) => {
          state.loading = "succeeded";
          state.data = action.payload;
        }
      )
      .addCase(updateSettings.rejected, (state, action) => {
>>>>>>> c59748663a538165bb6fb232a4bf718ff709930d
        state.loading = "failed";
        state.error = action.payload as string;
      });
  },
});

<<<<<<< HEAD
export const { clearSettingsError } = settingsSlice.actions;

// Selectors
export const selectSystemSettings = (state: RootState) =>
  state.settings.systemSettings;
export const selectSettingsLoading = (state: RootState) => state.settings.loading;
export const selectSettingsError = (state: RootState) => state.settings.error;

export default settingsSlice.reducer;
=======
export const { resetSettingsState } = settingsSlice.actions;

// Selectors
export const selectSettings = (state: RootState) => state.settings.data;
export const selectSettingsLoading = (state: RootState) =>
  state.settings.loading;
export const selectSettingsError = (state: RootState) => state.settings.error;

export default settingsSlice.reducer;
>>>>>>> c59748663a538165bb6fb232a4bf718ff709930d
