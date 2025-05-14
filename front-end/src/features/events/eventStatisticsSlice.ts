import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../store/index";
import axios from "axios";

export interface EventsByMonth {
  _id: {
    year: number;
    month: number;
  };
  count: number;
}

export interface TopOrganizer {
  organizer: {
    _id: string;
    username: string;
    email: string;
  };
  count: number;
}

export interface PopularEvent {
  _id: string;
  title: string;
  date: string;
  attendeeCount: number;
  organizer: {
    _id: string;
    username: string;
  };
}

export interface EventStatistics {
  totalEvents: number;
  publicEvents: number;
  privateEvents: number;
  eventsByMonth: EventsByMonth[];
  topOrganizers: TopOrganizer[];
  upcomingEvents: number;
  pastEvents: number;
  averageAttendees: number;
  mostPopularEvents: PopularEvent[];
}

interface EventStatisticsState {
  data: EventStatistics | null;
  loading: "idle" | "pending" | "succeeded" | "failed";
  error: string | null;
}

const initialState: EventStatisticsState = {
  data: null,
  loading: "idle",
  error: null,
};

// Async thunk to fetch event statistics
export const fetchEventStatistics = createAsyncThunk(
  "eventStatistics/fetchEventStatistics",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/api/events/statistics");
      return response.data;
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response) {
        return rejectWithValue(
          err.response.data.message || "Failed to fetch event statistics"
        );
      }
      const error = err as Error;
      return rejectWithValue(
        error.message || "Failed to fetch event statistics"
      );
    }
  }
);

// Create slice
const eventStatisticsSlice = createSlice({
  name: "eventStatistics",
  initialState,
  reducers: {
    resetEventStatistics: (state) => {
      state.data = null;
      state.loading = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEventStatistics.pending, (state) => {
        state.loading = "pending";
      })
      .addCase(
        fetchEventStatistics.fulfilled,
        (state, action: PayloadAction<EventStatistics>) => {
          state.loading = "succeeded";
          state.data = action.payload;
          state.error = null;
        }
      )
      .addCase(fetchEventStatistics.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.payload as string;
      });
  },
});

export const { resetEventStatistics } = eventStatisticsSlice.actions;

// Selectors
export const selectEventStatistics = (state: RootState) =>
  state.eventStatistics.data;
export const selectEventStatisticsLoading = (state: RootState) =>
  state.eventStatistics.loading;
export const selectEventStatisticsError = (state: RootState) =>
  state.eventStatistics.error;

export default eventStatisticsSlice.reducer;
