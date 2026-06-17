# Angular flow & what's new since you last used it

This app is built with **Angular 19**, which looks quite different from older
Angular (pre-v16). This guide maps the code and calls out the modern features so
the refresher sticks.

## Folder map

```
src/
  main.ts                      bootstraps the app (no AppModule anymore!)
  styles.scss                  GLOBAL styles: CSS variables, buttons, reset
  environments/environment.ts  the API base URL
  app/
    app.component.*            the shell (header + <router-outlet>)
    app.config.ts              app-wide providers (router, HttpClient)
    app.routes.ts              URL → component mapping
    models/customer.model.ts   TypeScript interfaces (the data shapes)
    core/customer.service.ts   all HTTP calls to the API
    features/customers/
      customer-list/           table of customers (+ delete)
      customer-detail/         one customer
      customer-form/           create AND edit (one reusable form)
```

## What changed since old Angular — the highlights

### 1. Standalone components (no NgModules)
Older Angular made you register every component in an `@NgModule`. Now each
component is **standalone** and declares its own dependencies in an `imports`
array right on the `@Component`. There is no `app.module.ts` — the app boots from
[`main.ts`](src/main.ts) via `bootstrapApplication(AppComponent, appConfig)`.

### 2. Signals for state
Components hold state in **signals** instead of plain fields:

```ts
readonly customers = signal<Customer[]>([]);   // create
this.customers.set(data);                       // write
@for (c of customers(); track c.id) { … }       // read (call it like a function)
```

When a signal changes, only the parts of the template that read it re-render.
This is simpler and faster than the old "Angular checks everything" model.

### 3. Built-in control flow: `@if` / `@for` / `@else`
The old structural directives `*ngIf` and `*ngFor` are replaced by block syntax
baked into the template language:

```html
@if (loading()) { … } @else if (error()) { … } @else { … }
@for (c of customers(); track c.id) { … }
```

`track` (required on `@for`) tells Angular how to identify each item so it updates
the DOM efficiently. **Gotcha you'll hit:** the `; as alias` shorthand only works
on a *primary* `@if`, never on `@else if` — see `customer-detail.component.html`.

### 4. `inject()` instead of constructor injection
We grab dependencies with `inject(CustomerService)` as a field initializer rather
than listing them as constructor parameters. Both still work; `inject()` is the
newer, terser style.

### 5. Providers live in `app.config.ts`
App-wide services are registered here. We added `provideHttpClient()` so the
`HttpClient` is available, and `provideRouter(routes)` for navigation.

## How data flows through the app

```
Component (e.g. CustomerListComponent)
   │  injects CustomerService
   ▼
CustomerService.getAll()  →  HttpClient.get<Customer[]>(url)   returns an Observable
   │
   ▼
component .subscribe({ next, error })   ← the request fires here
   │   next: this.customers.set(data)
   ▼
signal changes → template re-renders the @for table
```

Key idea: **Observables are lazy.** `http.get(...)` does nothing until something
`subscribe`s. The component subscribes, stores the result in a signal, and the
template reacts.

## Routing

[`app.routes.ts`](src/app/app.routes.ts) maps URLs to components, and the router
renders the match into `<router-outlet>` in the shell:

| URL                      | Component             |
|--------------------------|-----------------------|
| `/customers`             | list                  |
| `/customers/new`         | form (create mode)    |
| `/customers/:id`         | detail                |
| `/customers/:id/edit`    | form (edit mode)      |

The **form component is reused** for create and edit. It checks for an `:id` in
the route: present → load the record and update; absent → create. Navigation in
templates uses `routerLink`; in code it uses `Router.navigate([...])`.

## Reactive forms

`customer-form` uses **reactive forms** — the form is defined in TypeScript:

```ts
this.fb.nonNullable.group({
  firstName: ['', [Validators.required, Validators.maxLength(50)]],
  email:     ['', [Validators.required, Validators.email]],
  …
});
```

`nonNullable` types the controls as `string` (not `string | null`). Validators
mirror the backend's FluentValidation rules, and the template shows an error under
a field only once the user has touched it (`showError(...)`).

## The CSS approach (your HTML/CSS refresher)

- **Global vs scoped.** [`styles.scss`](src/styles.scss) is global: it holds the
  design tokens (CSS variables like `--primary`), a tiny reset, and shared `.btn`
  classes. Each component's `.scss` is **scoped** — those rules only apply inside
  that component, so class names never collide across the app.
- **CSS variables** (`:root { --primary: … }`, read with `var(--primary)`) let you
  theme from one place.
- **Flexbox** lays out rows of things with even gaps (header bar, button groups,
  the stacked form). **CSS Grid** handles the two-column label/value layout in the
  detail page.
- **`box-sizing: border-box`** (in the reset) makes `width` include padding and
  border — far more intuitive sizing.
- **Semantic HTML**: a `<table>` for tabular data, `<dl>/<dt>/<dd>` for label/value
  pairs, `<label for="id">` paired with inputs for accessibility, and proper
  `type="email"`/`type="tel"` inputs.
- **Naming**: classes use a light **BEM** style — `block__element` and
  `block--modifier` (e.g. `.btn`, `.btn--primary`, `.page__header`).

## Run it

```bash
npm install     # first time
npm start       # ng serve → http://localhost:4200
```

Make sure the API is running on http://localhost:5147 first (see the top-level
README), otherwise the list will show the "Is the API running?" error.
