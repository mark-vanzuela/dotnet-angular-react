# Customer CRUD — .NET API · Angular · React

A small, **learning-focused** project that manages customers (create, read, update,
soft-delete) across three apps that share one backend:

| App         | Folder         | Tech                                   | Status        |
|-------------|----------------|----------------------------------------|---------------|
| Web API     | [`api/`](api/) | .NET 8, Clean Architecture, CQRS       | ✅ Built       |
| Angular SPA | [`angular-app/`](angular-app/) | Angular 19 (standalone, signals) | ✅ Built       |
| React SPA   | `react-app/`   | React + Vite                           | ⏳ Coming next |

The goal is to refresh modern Angular and HTML/CSS fundamentals, so the code is
deliberately small, heavily commented, and each project has a **`FLOW.md`** that
walks through how it works.

## How the pieces fit together

```
┌──────────────┐        HTTP/JSON         ┌─────────────────────────┐
│  Angular SPA │  ───────────────────▶   │  .NET Web API           │
│  (port 4200) │  ◀───────────────────   │  (port 5147)            │
└──────────────┘                          │   Controller            │
┌──────────────┐                          │   → MediatR (CQRS)      │
│  React SPA   │  ───────────────────▶   │   → Validator           │
│  (port 5173) │  ◀───────────────────   │   → Handler             │
└──────────────┘                          │   → In-memory repo      │
                                          └─────────────────────────┘
```

Both front-ends call the **same** REST endpoints. The API stores data **in memory**
(no database), so data resets every time the API restarts. CORS on the API allows
the two dev-server origins above.

### REST endpoints

| Verb   | Route                 | Purpose               |
|--------|-----------------------|-----------------------|
| GET    | `/api/customers`      | list (non-deleted)    |
| GET    | `/api/customers/{id}` | single customer       |
| POST   | `/api/customers`      | create                |
| PUT    | `/api/customers/{id}` | update                |
| DELETE | `/api/customers/{id}` | **soft** delete       |

## Running it locally

### 1. The API (start this first)

```bash
cd api
dotnet run --project src/CustomerApi.Api
```

- API: http://localhost:5147
- Swagger UI: http://localhost:5147/swagger
- Run the tests: `dotnet test`

### 2. The Angular app

```bash
cd angular-app
npm install      # first time only
npm start        # = ng serve, on http://localhost:4200
```

Open http://localhost:4200 and you should see the seeded customers. Create, edit,
view, and delete — watch the API console print a log line for each write.

## Learn the internals

- **[api/FLOW.md](api/FLOW.md)** — Clean Architecture, CQRS, the request lifecycle.
- **[angular-app/FLOW.md](angular-app/FLOW.md)** — standalone components, signals,
  routing, services, reactive forms, and the CSS approach.

## Prerequisites

.NET SDK 8, Node.js 20.11+, npm. (The React app will use the same Node setup.)
