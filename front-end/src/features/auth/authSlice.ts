// RMIT University Vietnam
//   Course: COSC2769 Full Stack Development
//   Semester: 2025A
//   Assessment: Assignment 3
//   Author: GROUP 12
//   Student Name: Nguyen Chi Nghia, Nguyen Bao Hoang, Minh Tran Quang, Hieu Nguyen Minh

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import * as authService from "../../services/authService";
import type { RootState } from "../../store";
import axios from "axios";

// Define types for user data and state
interface UserData {
  id: string;
  username: string;
  email: string;
  role: string;
  // Add other relevant user fields returned by backend
}

interface AuthState {
  user: UserData | null;
  isAuthenticated: boolean;
  loading: "idle" | "pending" | "succeeded" | "failed";
  error: string | null;
  appInitialized: boolean; // To track if initial user check is done
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: "idle", // 'idle' | 'pending' | 'succeeded' | 'failed'
  error: null,
  appInitialized: false,
};

interface RegisterUserData {
  username: string;
  email: string;
  password: string;
  role?: "attendee" | "organizer"; // Added optional role property
}

interface LoginCredentials {
  email: string;
  password: string;
}

// --- Async Thunks --- (for API calls)

export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (userData: RegisterUserData, { rejectWithValue }) => {
    try {
      const response = await authService.register(userData);
      return response.message; // Or handle response data as needed
    } catch (error: unknown) {
      // Handle axios error properly
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(
          error.response.data.message || "Registration failed"
        );
      }
      const err = error as Error;
      return rejectWithValue(err.message || "Registration failed");
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const data = await authService.login(credentials);
      return data.user as UserData; // Return user data on success
    } catch (error: unknown) {
      // Handle axios error properly
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(error.response.data.message || "Login failed");
      }
      const err = error as Error;
      return rejectWithValue(err.message || "Login failed");
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
      return; // No data needed on successful logout
    } catch (error: unknown) {
      // Handle axios error properly
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(error.response.data.message || "Logout failed");
      }
      const err = error as Error;
      return rejectWithValue(err.message || "Logout failed");
    }
  }
);

// Thunk to check authentication status on app load
export const checkAuthStatus = createAsyncThunk(
  "auth/checkAuthStatus",
  async (_, { rejectWithValue }) => {
    try {
      const data = await authService.getCurrentUser();
      return data?.user as UserData | null; // Return user data or null
    } catch {
      // For auth status check, we don't need to show the error to the user
      // as this is usually called on app startup
      // 401 Unauthorized is expected when not logged in
      return rejectWithValue("Failed to check auth status");
    }
  }
);

// --- Slice Definition ---

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Can add synchronous reducers here if needed
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register Cases
      .addCase(registerUser.pending, (state) => {
        state.loading = "pending";
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = "succeeded";
        // Optionally show success message, maybe redirect to login?
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.payload as string;
      })

      // Login Cases
      .addCase(loginUser.pending, (state) => {
        state.loading = "pending";
        state.error = null;
      })
      .addCase(
        loginUser.fulfilled,
        (state, action: PayloadAction<UserData>) => {
          state.loading = "succeeded";
          state.isAuthenticated = true;
          state.user = action.payload;
          state.error = null;
        }
      )
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = "failed";
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload as string;
      })

      // Logout Cases
      .addCase(logoutUser.pending, (state) => {
        state.loading = "pending";
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = "succeeded";
        state.isAuthenticated = false;
        state.user = null;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = "failed";
        // Even if logout fails on the server, we'll force logout on the client
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload as string; // Inform user logout failed
      })

      // Check Auth Status Cases
      .addCase(checkAuthStatus.pending, (state) => {
        state.loading = "pending";
        state.appInitialized = false;
      })
      .addCase(
        checkAuthStatus.fulfilled,
        (state, action: PayloadAction<UserData | null>) => {
          state.loading = "succeeded";
          state.user = action.payload;
          state.isAuthenticated = !!action.payload; // True if user data exists, false otherwise
          state.appInitialized = true;
        }
      )
      .addCase(checkAuthStatus.rejected, (state, action) => {
        state.loading = "failed";
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload as string; // Can be ignored if expected on startup
        state.appInitialized = true; // Mark app as initialized even on failure
      });
  },
});

export const { clearError } = authSlice.actions;

// --- Selectors ---
export const selectUser = (state: RootState) => state.auth.user;
export const selectIsAuthenticated = (state: RootState) =>
  state.auth.isAuthenticated;
export const selectAuthLoading = (state: RootState) => state.auth.loading;
export const selectAuthError = (state: RootState) => state.auth.error;
export const selectAppInitialized = (state: RootState) =>
  state.auth.appInitialized;

export default authSlice.reducer;
