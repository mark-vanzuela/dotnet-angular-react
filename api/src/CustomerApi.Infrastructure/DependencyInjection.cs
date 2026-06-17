using CustomerApi.Application.Abstractions;
using CustomerApi.Infrastructure.Persistence;
using Microsoft.Extensions.DependencyInjection;

namespace CustomerApi.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services)
    {
        // SINGLETON: one shared in-memory store for the lifetime of the app, so
        // data persists between requests. (A real database repository would
        // usually be Scoped instead.)
        services.AddSingleton<ICustomerRepository, InMemoryCustomerRepository>();

        return services;
    }
}
