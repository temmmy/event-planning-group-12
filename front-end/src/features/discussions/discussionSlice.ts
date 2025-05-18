import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../store/index";
import axios from "axios";

export interface Message {
  _id: string;
  author: {
    _id: string;
    username: string;
    email: string;
    profileImage?: string;
  };
  content: string;
  createdAt: string;
}

export interface Discussion {
  _id: string;
  event: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

interface DiscussionState {
  discussion: Discussion | null;
  loading: "idle" | "pending" | "succeeded" | "failed";
  error: string | null;
}

const initialState: DiscussionState = {
  discussion: null,
  loading: "idle",
  error: null,
};

// Helper function to extract error message from various error types
const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error) && error.response) {
    return error.response.data.message || "An error occurred";
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Unknown error occurred";
};

// Async thunks
export const fetchEventDiscussion = createAsyncThunk(
  "discussions/fetchEventDiscussion",
  async (eventId: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/events/${eventId}/discussion`);
      return response.data;
    } catch (err: unknown) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const addMessage = createAsyncThunk(
  "discussions/addMessage",
  async (
    { eventId, content }: { eventId: string; content: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.post(
        `/api/events/${eventId}/discussion/messages`,
        {
          content,
        }
      );
      return response.data;
    } catch (err: unknown) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const deleteMessage = createAsyncThunk(
  "discussions/deleteMessage",
  async (
    { eventId, messageId }: { eventId: string; messageId: string },
    { rejectWithValue }
  ) => {
    try {
      await axios.delete(
        `/api/events/${eventId}/discussion/messages/${messageId}`
      );
      return messageId;
    } catch (err: unknown) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

// Create slice
const discussionSlice = createSlice({
  name: "discussions",
  initialState,
  reducers: {
    resetDiscussionState: (state) => {
      state.discussion = null;
      state.loading = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch discussion
      .addCase(fetchEventDiscussion.pending, (state) => {
        state.loading = "pending";
        state.error = null;
      })
      .addCase(
        fetchEventDiscussion.fulfilled,
        (state, action: PayloadAction<Discussion>) => {
          state.loading = "succeeded";
          state.discussion = action.payload;
          state.error = null;
        }
      )
      .addCase(fetchEventDiscussion.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.payload as string;
      })

      // Add message
      .addCase(addMessage.pending, (state) => {
        state.loading = "pending";
        state.error = null;
      })
      .addCase(
        addMessage.fulfilled,
        (state, action: PayloadAction<Discussion>) => {
          state.loading = "succeeded";
          state.discussion = action.payload;
          state.error = null;
        }
      )
      .addCase(addMessage.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.payload as string;
      })

      // Delete message
      .addCase(deleteMessage.pending, (state) => {
        state.loading = "pending";
        state.error = null;
      })
      .addCase(
        deleteMessage.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.loading = "succeeded";

          if (state.discussion) {
            state.discussion.messages = state.discussion.messages.filter(
              (message) => message._id !== action.payload
            );
          }

          state.error = null;
        }
      )
      .addCase(deleteMessage.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.payload as string;
      });
  },
});

export const { resetDiscussionState } = discussionSlice.actions;

export const selectDiscussion = (state: RootState) =>
  state.discussions.discussion;
export const selectDiscussionLoading = (state: RootState) =>
  state.discussions.loading;
export const selectDiscussionError = (state: RootState) =>
  state.discussions.error;

export default discussionSlice.reducer;
