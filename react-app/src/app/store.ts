import { configureStore } from '@reduxjs/toolkit';

import customersReducer from '../features/customers/customersSlice';

/**
 * The STORE is the single source of truth for app state. `configureStore` wires
 * our reducers together and sets up the Redux DevTools and sensible default
 * middleware automatically.
 *
 * The `customers` key here is why selectors read `state.customers.*`.
 */
export const store = configureStore({
  reducer: {
    customers: customersReducer
  }
});

// These two types are INFERRED from the store, so they always stay in sync with
// the actual state/dispatch. We use them to build typed hooks (see hooks.ts).
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
