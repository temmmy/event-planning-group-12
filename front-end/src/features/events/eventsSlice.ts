// RMIT University Vietnam
//   Course: COSC2769 Full Stack Development
//   Semester: 2025A
//   Assessment: Assignment 3
//   Author: GROUP 12
//   Student Name: Nguyen Chi Nghia, Nguyen Bao Hoang, Minh Tran Quang, Hieu Nguyen Minh

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../store/index";
import axios from "axios";

export interface Attendee {
  user: string;
  status: "pending" | "accepted" | "declined" | "requested";
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
  status?: "pending" | "accepted" | "declined" | "requested";
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
  isUserInvited?: boolean;
  userInvitationStatus?: "pending" | "accepted" | "declined" | "requested";
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

interface FetchEventsParams {
  visibility?: "all" | "public" | "private";
  timeframe?: "all" | "upcoming" | "past";
  myEventsOnly?: boolean;
  search?: string; // Optional: if you want to handle search server-side
}

// Async thunks
export const fetchEvents = createAsyncThunk(
  "events/fetchEvents",
  async (params: FetchEventsParams | undefined = {}, { rejectWithValue }) => {
    try {
      // Construct query parameters string
      const queryParams = new URLSearchParams();
      if (params?.visibility && params.visibility !== "all") {
        queryParams.append("visibility", params.visibility);
      }
      if (params?.timeframe && params.timeframe !== "all") {
        queryParams.append("timeframe", params.timeframe);
      }
      if (params?.myEventsOnly) {
        queryParams.append("myEventsOnly", "true");
      }
      if (params?.search) {
        queryParams.append("search", params.search);
      }
      const queryString = queryParams.toString();
      const apiUrl = queryString ? `/api/events?${queryString}` : "/api/events";

      const response = await axios.get(apiUrl);
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

export const respondToInvitation = createAsyncThunk(
  "events/respondToInvitation",
  async (
    { id, status }: { id: string; status: "accepted" | "declined" },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.put(`/api/events/${id}/respond`, { status });
      return response.data;
    } catch (err: unknown) {
      const error = err as Error;
      return rejectWithValue(
        error.message || "Failed to respond to invitation"
      );
    }
  }
);

export const requestToJoinEvent = createAsyncThunk(
  "events/requestToJoinEvent",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/api/events/${id}/request-join`);
      return response.data;
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response) {
        return rejectWithValue(
          err.response.data.message || "Failed to request to join event"
        );
      }
      const error = err as Error;
      return rejectWithValue(
        error.message || "Failed to request to join event"
      );
    }
  }
);

export const handleJoinRequest = createAsyncThunk(
  "events/handleJoinRequest",
  async (
    {
      eventId,
      userId,
      status,
    }: {
      eventId: string;
      userId: string;
      status: "accepted" | "declined";
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.put(
        `/api/events/${eventId}/join-request/${userId}`,
        { status }
      );
      return response.data.event;
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response) {
        return rejectWithValue(
          err.response.data.message || "Failed to handle join request"
        );
      }
      const error = err as Error;
      return rejectWithValue(error.message || "Failed to handle join request");
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
      })

      // Respond to invitation
      .addCase(respondToInvitation.pending, (state) => {
        state.loading = "pending";
      })
      .addCase(
        respondToInvitation.fulfilled,
        (state, action: PayloadAction<Event>) => {
          state.loading = "succeeded";

          // Update the event in the events array
          const index = state.events.findIndex(
            (e) => e._id === action.payload._id
          );
          if (index !== -1) {
            state.events[index] = action.payload;
          }

          // Update the current event if it's the one we just responded to
          if (state.event && state.event._id === action.payload._id) {
            state.event = action.payload;
          }

          state.success = true;
        }
      )
      .addCase(respondToInvitation.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.payload as string;
      })

      // Request to join event
      .addCase(requestToJoinEvent.pending, (state) => {
        state.loading = "pending";
      })
      .addCase(requestToJoinEvent.fulfilled, (state, action) => {
        state.loading = "succeeded";

        // The response comes as { event: Event, message: string }
        const response = action.payload;
        const updatedEvent = response.event;

        if (updatedEvent) {
          // Update the event in the events array
          const index = state.events.findIndex(
            (e) => e._id === updatedEvent._id
          );
          if (index !== -1) {
            state.events[index] = updatedEvent;
          }

          // Update the current event if it's the one we just requested to join
          if (state.event && state.event._id === updatedEvent._id) {
            state.event = updatedEvent;
          }
        }

        state.success = true;
      })
      .addCase(requestToJoinEvent.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.payload as string;
      })

      // Handle join request
      .addCase(handleJoinRequest.pending, (state) => {
        state.loading = "pending";
      })
      .addCase(
        handleJoinRequest.fulfilled,
        (state, action: PayloadAction<Event>) => {
          state.loading = "succeeded";

          // Update the event in the events array
          const index = state.events.findIndex(
            (e) => e._id === action.payload._id
          );
          if (index !== -1) {
            state.events[index] = action.payload;
          }

          // Update the current event if it's the one we just handled request for
          if (state.event && state.event._id === action.payload._id) {
            state.event = action.payload;
          }

          state.success = true;
        }
      )
      .addCase(handleJoinRequest.rejected, (state, action) => {
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
