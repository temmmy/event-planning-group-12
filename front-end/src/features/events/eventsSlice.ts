import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../store/index";
import axios from "axios";

export interface Attendee {
  user: string;
  status: "pending" | "accepted" | "declined";
  invitedAt: string;
  respondedAt?: string;
}

export interface Reminder {
  type: "upcoming" | "confirmation" | "no_response";
  sendAt: string;
  sent: boolean;
}

export interface EventUser {
  _id: string;
  name: string;
  email: string;
  profileImage?: string;
}

export interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  capacity: number;
  visibility: "public" | "private";
  backgroundColor: string;
  imageUrl?: string;
  coverImageUrl?: string;
  organizer: EventUser;
  attendees: EventUser[];
  createdAt: string;
  updatedAt: string;
}

export interface EventFormData {
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  image?: File;
  coverImage?: File;
  backgroundColor?: string;
  visibility: "public" | "private";
  capacity?: number;
}

interface EventsState {
  events: Event[];
  event: Event | null;
  loading: "idle" | "pending" | "succeeded" | "failed";
  error: string | null;
  success: boolean;
}

const initialState: EventsState = {
  events: [],
  event: null,
  loading: "idle",
  error: null,
  success: false,
};

// Async thunks
export const fetchEvents = createAsyncThunk(
  "events/fetchEvents",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/api/events");
      return response.data;
    } catch (err: unknown) {
      const error = err as Error;
      return rejectWithValue(error.message || "Failed to fetch events");
    }
  }
);

export const fetchEventById = createAsyncThunk(
  "events/fetchEventById",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/events/${id}`);
      return response.data;
    } catch (err: unknown) {
      const error = err as Error;
      return rejectWithValue(error.message || "Failed to fetch event");
    }
  }
);

export const createEvent = createAsyncThunk(
  "events/createEvent",
  async (eventData: FormData, { rejectWithValue }) => {
    try {
      const response = await axios.post("/api/events", eventData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (err: unknown) {
      const error = err as Error;
      return rejectWithValue(error.message || "Failed to create event");
    }
  }
);

export const updateEvent = createAsyncThunk(
  "events/updateEvent",
  async (
    { id, eventData }: { id: string; eventData: FormData },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.put(`/api/events/${id}`, eventData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (err: unknown) {
      const error = err as Error;
      return rejectWithValue(error.message || "Failed to update event");
    }
  }
);

export const deleteEvent = createAsyncThunk(
  "events/deleteEvent",
  async (id: string, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/events/${id}`);
      return id;
    } catch (err: unknown) {
      const error = err as Error;
      return rejectWithValue(error.message || "Failed to delete event");
    }
  }
);

export const inviteToEvent = createAsyncThunk(
  "events/inviteToEvent",
  async (
    { id, emails }: { id: string; emails: string[] },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.post(`/api/events/${id}/invite`, { emails });
      return response.data;
    } catch (err: unknown) {
      const error = err as Error;
      return rejectWithValue(error.message || "Failed to send invitations");
    }
  }
);

// Create slice
const eventsSlice = createSlice({
  name: "events",
  initialState,
  reducers: {
    resetEventState: (state) => {
      state.event = null;
      state.loading = "idle";
      state.error = null;
      state.success = false;
    },
    clearEventErrors: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all events
      .addCase(fetchEvents.pending, (state) => {
        state.loading = "pending";
      })
      .addCase(
        fetchEvents.fulfilled,
        (state, action: PayloadAction<Event[]>) => {
          state.loading = "succeeded";
          state.events = action.payload;
        }
      )
      .addCase(fetchEvents.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.payload as string;
      })

      // Fetch single event
      .addCase(fetchEventById.pending, (state) => {
        state.loading = "pending";
      })
      .addCase(
        fetchEventById.fulfilled,
        (state, action: PayloadAction<Event>) => {
          state.loading = "succeeded";
          state.event = action.payload;
        }
      )
      .addCase(fetchEventById.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.payload as string;
      })

      // Create event
      .addCase(createEvent.pending, (state) => {
        state.loading = "pending";
      })
      .addCase(createEvent.fulfilled, (state, action: PayloadAction<Event>) => {
        state.loading = "succeeded";
        state.events.push(action.payload);
        state.event = action.payload;
        state.success = true;
      })
      .addCase(createEvent.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.payload as string;
      })

      // Update event
      .addCase(updateEvent.pending, (state) => {
        state.loading = "pending";
      })
      .addCase(updateEvent.fulfilled, (state, action: PayloadAction<Event>) => {
        state.loading = "succeeded";
        state.events = state.events.map((event) =>
          event._id === action.payload._id ? action.payload : event
        );
        state.event = action.payload;
        state.success = true;
      })
      .addCase(updateEvent.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.payload as string;
      })

      // Delete event
      .addCase(deleteEvent.pending, (state) => {
        state.loading = "pending";
      })
      .addCase(
        deleteEvent.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.loading = "succeeded";
          state.events = state.events.filter(
            (event) => event._id !== action.payload
          );
          state.success = true;
        }
      )
      .addCase(deleteEvent.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.payload as string;
      })

      // Invite to event
      .addCase(inviteToEvent.pending, (state) => {
        state.loading = "pending";
      })
      .addCase(inviteToEvent.fulfilled, (state, action) => {
        state.loading = "succeeded";

        // If we have updated event data in the response, update it in state
        if (action.payload.event) {
          const updatedEvent = action.payload.event;
          const index = state.events.findIndex(
            (e) => e._id === updatedEvent._id
          );

          if (index !== -1) {
            state.events[index] = updatedEvent;
          }

          // Also update currentEvent if it's the one we just invited people to
          if (state.event && state.event._id === updatedEvent._id) {
            state.event = updatedEvent;
          }
        }

        state.success = true;
      })
      .addCase(inviteToEvent.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.payload as string;
      });
  },
});

export const { resetEventState, clearEventErrors } = eventsSlice.actions;

export const selectAllEvents = (state: RootState) => state.events.events;
export const selectEvent = (state: RootState) => state.events.event;
export const selectEventById = (state: RootState, eventId: string) =>
  state.events.events.find((event) => event._id === eventId);
export const selectEventsLoading = (state: RootState) => state.events.loading;
export const selectEventsError = (state: RootState) => state.events.error;
export const selectEventsSuccess = (state: RootState) => state.events.success;

export default eventsSlice.reducer;
