# React app flow — with Redux Toolkit state management

This app is **React 19 + TypeScript + Vite**, and its main teaching goal is
**state management with Redux Toolkit (RTK)**. It talks to the same .NET API as the
Angular app and has the same features: list, detail, create/edit, soft-delete.

## Folder map

```
src/
  main.tsx                     entry point: wraps <App> in <Provider> + <BrowserRouter>
  index.css                    GLOBAL styles: CSS variables, buttons, reset
  App.tsx / App.module.css     shell (header) + the route table
  types/customer.ts            TypeScript types (data shapes)
  api/customerApi.ts           fetch wrapper — all HTTP calls in one place
  app/
    store.ts                   the Redux store (single source of truth)
    hooks.ts                   typed useAppDispatch / useAppSelector
  features/customers/
    customersSlice.ts          ⭐ the state: slice + async thunks + selectors
    CustomerList.tsx           table of customers (+ delete)
    CustomerDetail.tsx         one customer
    CustomerForm.tsx           create AND edit (controlled-input form)
    *.module.css               scoped styles per component
```

## State management with Redux Toolkit — the mental model

Redux gives you **one central store** (a big state object). Components never mutate
it directly; instead the flow is a one-way loop:

```
        ┌─────────────────────────────────────────────────────────┐
        │                       STORE                              │
        │            { customers: { items, status, … } }           │
        └─────────────────────────────────────────────────────────┘
            ▲                                          │
   dispatch │ (an action / thunk)         useSelector  │ (read a slice)
            │                                          ▼
        ┌────────────────┐                     ┌──────────────────┐
        │   COMPONENT     │ ──────────────────▶ │   COMPONENT       │
        │ dispatch(thunk) │   re-renders when   │ reads state via   │
        └────────────────┘   selected state     │ selectors         │
                              changes            └──────────────────┘
```

1. A component **dispatches** an action (often a thunk): `dispatch(fetchCustomers())`.
2. A **reducer** in the slice receives the action and returns the next state.
3. Components **read** state with selectors via `useAppSelector(selectCustomers)`.
4. When the selected state changes, those components **re-render**. One-way data
   flow — predictable and easy to debug (try the Redux DevTools browser extension).

### The slice — [`features/customers/customersSlice.ts`](src/features/customers/customersSlice.ts)
A "slice" bundles a piece of state with the reducers that change it. Key parts:

- **state shape**: `{ items, status, error, selected, selectedStatus }`. The
  `status` strings (`idle | loading | succeeded | failed`) drive the UI.
- **`createAsyncThunk`**: reducers must be synchronous, so async work (HTTP) goes
  in thunks. Each thunk auto-dispatches `pending` / `fulfilled` / `rejected`
  actions; we handle those in `extraReducers` to flip status and store data.
- **"mutating" reducers**: RTK uses Immer under the hood, so writing
  `state.items = action.payload` is safe — Immer turns it into an immutable update.
- **selectors**: small read functions (`selectCustomers`, …) so components never
  reach into `state.customers.*` directly. `selectCustomerCount` uses
  `createSelector` for **memoized** derived data.

### The store & typed hooks
- [`app/store.ts`](src/app/store.ts) — `configureStore` combines reducers and
  exports the inferred `RootState` / `AppDispatch` types.
- [`app/hooks.ts`](src/app/hooks.ts) — `useAppDispatch` / `useAppSelector` are the
  pre-typed versions you use everywhere (the officially recommended TS pattern).
- [`main.tsx`](src/main.tsx) — `<Provider store={store}>` makes the store reachable
  from any component.

## Following one action end-to-end (delete)

```
User clicks Delete in CustomerList
        │  dispatch(deleteCustomer(id))
        ▼
deleteCustomer thunk → customerApi.remove(id) → DELETE /api/customers/{id}
        │  on success the thunk returns the id
        ▼
extraReducers: deleteCustomer.fulfilled
        │  state.items = items.filter(c => c.id !== id)
        ▼
selectCustomers value changes → CustomerList re-renders → row disappears
```

## Other React concepts shown here

- **Hooks**: `useState` (local form state), `useEffect` (run code after render —
  we load data on mount with a `[]`-style dependency array, and clean up on
  unmount), `useParams` / `useNavigate` (router).
- **Controlled inputs** (`CustomerForm`): each input's `value` comes from state and
  `onChange` writes back — state is the single source of truth. This is React's
  counterpart to Angular's reactive forms.
- **Conditional rendering & lists**: plain JS in JSX — `status === 'loading' && …`
  and `customers.map(c => <tr key={c.id}>…)` (lists need a stable `key`).

## React vs Angular — quick comparison (same app, two ways)

| Concern            | Angular app                         | React app                              |
|--------------------|-------------------------------------|----------------------------------------|
| State              | signals (local to component)        | Redux store (central) + `useState`     |
| Data fetching      | service + RxJS `Observable`         | thunk + `fetch` in `customerApi`       |
| Templates          | HTML files, `@if`/`@for`            | JSX in `.tsx`, `&&` / `.map()`         |
| Forms              | Reactive Forms (`FormGroup`)        | controlled inputs (`useState`)         |
| DI                 | `inject(Service)`                   | import the store/hooks directly        |
| Scoped styles      | component `.scss` (automatic)       | CSS Modules (`*.module.css`)           |
| Routing            | `Routes` + `<router-outlet>`        | `<Routes>`/`<Route>` + `<Link>`        |

## Run it

```bash
npm install     # first time
npm run dev     # http://localhost:5173
```

Start the .NET API first (http://localhost:5147 — see the top-level README). The
API already allows the `:5173` origin via CORS. Open the **Redux DevTools** in your
browser to watch actions fire and state change as you click around.
