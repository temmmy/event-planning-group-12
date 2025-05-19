// RMIT University Vietnam
//   Course: COSC2769 Full Stack Development
//   Semester: 2025A
//   Assessment: Assignment 3
//   Author: GROUP 12
//   Student Name: Nguyen Chi Nghia, Nguyen Bao Hoang, Minh Tran Quang, Hieu Nguyen Minh

import { configureStore } from "@reduxjs/toolkit";
// Import your reducers here
import authReducer from "../features/auth/authSlice";
import settingsReducer from "../features/settings/settingsSlice";
import eventsReducer from "../features/events/eventsSlice";
import eventStatisticsReducer from "../features/events/eventStatisticsSlice";
import discussionsReducer from "../features/discussions/discussionSlice";

export const store = configureStore({
  reducer: {
    // Add reducers here
    auth: authReducer,
    settings: settingsReducer,
    events: eventsReducer,
    eventStatistics: eventStatisticsReducer,
    discussions: discussionsReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {counter: CounterState, auth: AuthState, settings: SettingsState, events: EventsState, eventStatistics: EventStatisticsState, discussions: DiscussionState}
export type AppDispatch = typeof store.dispatch;
