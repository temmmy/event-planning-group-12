import { configureStore } from "@reduxjs/toolkit";
// Import your reducers here
import counterReducer from "../features/counter/counterSlice";
import authReducer from "../features/auth/authSlice";
import settingsReducer from "../features/settings/settingsSlice";
<<<<<<< HEAD
=======
import eventsReducer from "../features/events/eventsSlice";
>>>>>>> c59748663a538165bb6fb232a4bf718ff709930d

export const store = configureStore({
  reducer: {
    // Add reducers here
    counter: counterReducer,
    auth: authReducer,
    settings: settingsReducer,
<<<<<<< HEAD
=======
    events: eventsReducer,
>>>>>>> c59748663a538165bb6fb232a4bf718ff709930d
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {counter: CounterState, auth: AuthState, settings: SettingsState, events: EventsState}
export type AppDispatch = typeof store.dispatch;
