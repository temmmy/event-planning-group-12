import { configureStore } from "@reduxjs/toolkit";
// Import your reducers here
import counterReducer from "../features/counter/counterSlice";
import authReducer from "../features/auth/authSlice";

export const store = configureStore({
  reducer: {
    // Add reducers here
    counter: counterReducer,
    auth: authReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {counter: CounterState, auth: AuthState}
export type AppDispatch = typeof store.dispatch;
