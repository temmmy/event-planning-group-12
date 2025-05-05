import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import * as authService from "../../services/authService";
import type { RootState } from "../../store";

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

// --- Async Thunks --- (for API calls)

export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (userData: any, { rejectWithValue }) => {
    try {
      const response = await authService.register(userData);
      return response.message; // Or handle response data as needed
    } catch (error: any) {
      return rejectWithValue(error.message || "Registration failed");
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials: any, { rejectWithValue }) => {
    try {
      const data = await authService.login(credentials);
      return data.user as UserData; // Return user data on success
    } catch (error: any) {
      return rejectWithValue(error.message || "Login failed");
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
      return; // No data needed on successful logout
    } catch (error: any) {
      return rejectWithValue(error.message || "Logout failed");
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
    } catch (error: any) {
      return rejectWithValue("Failed to check auth status"); // Don't necessarily fail if 401
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
        // Keep user logged in state? Or force logout?
        // state.isAuthenticated = false; // Consider implications
        // state.user = null;
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
