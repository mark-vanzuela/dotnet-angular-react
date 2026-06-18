import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

import { customerApi } from '../../api/customerApi';
import type { Customer, CustomerPayload } from '../../types/customer';
import type { RootState } from '../../app/store';

/*
  ============================================================================
  THE REDUX SLICE — this single file is the core of state management.
  ============================================================================

  Mental model of Redux:
    - There is ONE central "store" holding all app state (a big object).
    - You never mutate it directly. Instead you DISPATCH an "action".
    - A "reducer" receives the current state + the action and returns the next
      state. Redux Toolkit lets us "mutate" a draft inside reducers (it uses
      Immer under the hood to produce an immutable update for us).
    - Components READ state with a "selector" and TRIGGER changes by dispatching.

  A "slice" bundles together one section of state plus the reducers that change
  it. Here the slice owns everything about customers.
*/

// The shape of THIS slice's state.
interface CustomersState {
  items: Customer[];
  // A status string is a clean way to drive loading/empty/error UI.
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  // The single customer currently being viewed/edited (detail & form screens).
  selected: Customer | null;
  selectedStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
}

const initialState: CustomersState = {
  items: [],
  status: 'idle',
  error: null,
  selected: null,
  selectedStatus: 'idle'
};

/*
  ---- ASYNC THUNKS ----------------------------------------------------------
  A plain reducer must be synchronous. For async work (HTTP calls) we use
  `createAsyncThunk`. Each thunk automatically dispatches three actions for us:
  `pending` (started), `fulfilled` (resolved with a value), and `rejected`
  (threw). We handle those in `extraReducers` below to update status/data.
*/

export const fetchCustomers = createAsyncThunk('customers/fetchAll', () =>
  customerApi.getAll()
);

export const fetchCustomerById = createAsyncThunk('customers/fetchById', (id: string) =>
  customerApi.getById(id)
);

export const createCustomer = createAsyncThunk('customers/create', (payload: CustomerPayload) =>
  customerApi.create(payload)
);

export const updateCustomer = createAsyncThunk(
  'customers/update',
  ({ id, payload }: { id: string; payload: CustomerPayload }) => customerApi.update(id, payload)
);

export const deleteCustomer = createAsyncThunk('customers/delete', async (id: string) => {
  await customerApi.remove(id);
  // Return the id so the reducer knows which item to drop from the list.
  return id;
});

const customersSlice = createSlice({
  name: 'customers',
  initialState,
  // `reducers` are synchronous actions. We add one to clear the selected
  // customer when leaving a screen, so stale data does not flash on the next.
  reducers: {
    clearSelected(state) {
      state.selected = null;
      state.selectedStatus = 'idle';
    }
  },
  // `extraReducers` respond to actions defined elsewhere — here, the auto
  // pending/fulfilled/rejected actions from our thunks.
  extraReducers: (builder) => {
    builder
      // ---- list ----
      .addCase(fetchCustomers.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchCustomers.fulfilled, (state, action: PayloadAction<Customer[]>) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchCustomers.rejected, (state) => {
        state.status = 'failed';
        state.error = 'Could not load customers. Is the API running?';
      })

      // ---- single ----
      .addCase(fetchCustomerById.pending, (state) => {
        state.selectedStatus = 'loading';
        state.selected = null;
      })
      .addCase(fetchCustomerById.fulfilled, (state, action: PayloadAction<Customer>) => {
        state.selectedStatus = 'succeeded';
        state.selected = action.payload;
      })
      .addCase(fetchCustomerById.rejected, (state) => {
        state.selectedStatus = 'failed';
      })

      // ---- delete: remove the item from the in-memory list immediately ----
      .addCase(deleteCustomer.fulfilled, (state, action: PayloadAction<string>) => {
        state.items = state.items.filter((c) => c.id !== action.payload);
      });
    // Note: create/update navigate back to the list, which re-fetches, so they
    // need no special state handling here.
  }
});

export const { clearSelected } = customersSlice.actions;

/*
  ---- SELECTORS -------------------------------------------------------------
  Selectors are small functions that read a piece of state. Keeping them here
  (instead of reaching into state.customers.* in components) means the state
  shape stays an implementation detail of the slice.
*/
export const selectCustomers = (state: RootState) => state.customers.items;
export const selectCustomersStatus = (state: RootState) => state.customers.status;
export const selectCustomersError = (state: RootState) => state.customers.error;
export const selectSelectedCustomer = (state: RootState) => state.customers.selected;
export const selectSelectedStatus = (state: RootState) => state.customers.selectedStatus;

// `createSelector` builds a MEMOIZED selector: it only recomputes when its
// inputs change. Handy for derived data — here, the customer count.
export const selectCustomerCount = createSelector(selectCustomers, (items) => items.length);

export default customersSlice.reducer;
