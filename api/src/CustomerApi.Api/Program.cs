using CustomerApi.Api.Middleware;
using CustomerApi.Application;
using CustomerApi.Infrastructure;

// Program.cs is the application's COMPOSITION ROOT: the single place where every
// layer is wired together and the HTTP pipeline is configured.

var builder = WebApplication.CreateBuilder(args);

// --- Console logging -------------------------------------------------------
// ASP.NET Core logs to the console by default. We clear and re-add the console
// provider explicitly so the logging story is obvious to anyone reading this.
builder.Logging.ClearProviders();
builder.Logging.AddConsole();

// --- Register services (Dependency Injection) ------------------------------
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Each layer contributes its own services through one extension method.
builder.Services.AddApplication();      // MediatR handlers, validators, pipeline
builder.Services.AddInfrastructure();   // the in-memory repository

// --- CORS ------------------------------------------------------------------
// Browsers block a page served from http://localhost:4200 (Angular) from calling
// an API on a different origin unless the API explicitly allows it. This policy
// opens the door for our local front-ends.
const string FrontendCorsPolicy = "AllowLocalFrontends";
builder.Services.AddCors(options =>
{
    options.AddPolicy(FrontendCorsPolicy, policy =>
        policy
            .WithOrigins(
                "http://localhost:4200", // Angular dev server
                "http://localhost:5173") // React (Vite) dev server, for later
            .AllowAnyHeader()
            .AllowAnyMethod());
});

var app = builder.Build();

// --- HTTP request pipeline -------------------------------------------------
// Order matters: each piece of middleware runs in the order added here.

// Our custom error handler goes first so it can catch exceptions from everything
// after it.
app.UseMiddleware<ExceptionHandlingMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors(FrontendCorsPolicy);

app.MapControllers();

app.Run();
