# API flow & architecture

This document explains how the .NET API is structured and what happens on each
request. The aim is that you can read it once and then navigate the code with a
mental map.

## The big idea: Clean Architecture

The solution is split into four projects arranged as concentric layers. The
**golden rule** is that dependencies point *inward* — outer layers know about
inner layers, never the reverse.

```
        ┌─────────────────────────────────────────────┐
        │ CustomerApi.Api  (controllers, DI, HTTP)     │  ← outermost
        │  ┌───────────────────────────────────────┐  │
        │  │ CustomerApi.Infrastructure (in-mem repo)│  │
        │  │  ┌─────────────────────────────────┐   │  │
        │  │  │ CustomerApi.Application (CQRS)   │   │  │
        │  │  │   ┌─────────────────────────┐   │   │  │
        │  │  │   │ CustomerApi.Domain      │   │   │  │  ← innermost
        │  │  │   │ (Customer entity)       │   │   │  │
        │  │  │   └─────────────────────────┘   │   │  │
        │  │  └─────────────────────────────────┘   │  │
        │  └───────────────────────────────────────┘  │
        └─────────────────────────────────────────────┘
```

| Project | Depends on | Responsibility |
|---------|-----------|----------------|
| **Domain** | (nothing) | The `Customer` entity and its rules. Pure C#. |
| **Application** | Domain | Use cases (CQRS handlers), the `ICustomerRepository` contract, DTOs, validation. |
| **Infrastructure** | Application, Domain | The actual repository (`InMemoryCustomerRepository`). |
| **Api** | Application, Infrastructure | HTTP controllers, DI wiring, Swagger, CORS, logging, error handling. |

Why bother? Because the business logic (Application + Domain) has **no idea** it
is being used over HTTP or that data lives in memory. Swap the repository for a
SQL one, or add a gRPC front-end, and the core never changes.

## CQRS with vertical slices

**CQRS** = Command Query Responsibility Segregation: writes are *Commands*, reads
are *Queries*. We use the [MediatR](https://github.com/jbogard/MediatR) library so
a controller just "sends" a message and MediatR finds the one handler for it.

Instead of grouping code by technical type (all commands here, all handlers
there), we group by **feature** — a *vertical slice*. Everything one use case needs
sits in one folder:

```
Application/Features/Customers/
  CreateCustomer/   CreateCustomerCommand.cs + Handler.cs + Validator.cs
  UpdateCustomer/   UpdateCustomerCommand.cs + Handler.cs + Validator.cs
  DeleteCustomer/   DeleteCustomerCommand.cs + Handler.cs        (soft delete)
  GetCustomerById/  GetCustomerByIdQuery.cs  + Handler.cs
  GetCustomers/     GetCustomersQuery.cs     + Handler.cs
```

To add a feature you create one new folder — you rarely touch existing files.

## The lifecycle of a request

Take **POST /api/customers** as the example:

```
HTTP POST /api/customers  {firstName, lastName, email, phone}
        │
        ▼
1. CustomersController.Create()                 (Api layer)
        │  builds a CreateCustomerCommand and calls _sender.Send(command)
        ▼
2. ValidationBehavior                           (Application pipeline)
        │  runs CreateCustomerValidator. If it fails → throws ValidationException
        ▼
3. CreateCustomerHandler.Handle()               (Application layer)
        │  Customer.Create(...) builds the entity
        │  _repository.AddAsync(customer)
        │  _logger.LogInformation(...)           ← prints to the console
        ▼
4. InMemoryCustomerRepository                    (Infrastructure layer)
        │  stores the customer in a ConcurrentDictionary
        ▼
5. Handler returns a CustomerDto  →  Controller returns 201 Created
```

Reads (the queries) skip validation and the logger but otherwise follow the same
controller → MediatR → handler → repository path.

## Cross-cutting concerns

- **Validation** — [`Common/Behaviors/ValidationBehavior.cs`](src/CustomerApi.Application/Common/Behaviors/ValidationBehavior.cs)
  is MediatR middleware that runs the matching FluentValidation rules before every
  handler. One place, applies everywhere.
- **Error handling** — [`Middleware/ExceptionHandlingMiddleware.cs`](src/CustomerApi.Api/Middleware/ExceptionHandlingMiddleware.cs)
  turns exceptions into clean HTTP responses: `NotFoundException` → **404**,
  `ValidationException` → **400** (with field errors), anything else → **500**.
- **Logging** — configured in [`Program.cs`](src/CustomerApi.Api/Program.cs) to write
  to the console. Handlers log each create/update/delete.
- **Soft delete** — delete never removes data; `Customer.MarkAsDeleted()` flips an
  `IsDeleted` flag and the repository hides flagged records from reads.

## Persistence note

`InMemoryCustomerRepository` is registered as a **singleton**, so the same
dictionary lives for the whole process and data survives between requests — but it
**resets when the API restarts**. Two sample customers are seeded on startup.

## Tests

[`tests/CustomerApi.UnitTests`](tests/CustomerApi.UnitTests) uses **xUnit**,
**FluentAssertions**, and **Moq**. Tests cover each handler (happy path +
not-found), the create validator, and that a soft-deleted customer disappears from
the listing. Run them with `dotnet test`.
