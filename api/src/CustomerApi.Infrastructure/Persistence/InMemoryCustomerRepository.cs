using System.Collections.Concurrent;
using CustomerApi.Application.Abstractions;
using CustomerApi.Domain.Customers;

namespace CustomerApi.Infrastructure.Persistence;

/// <summary>
/// The concrete repository. This is the "detail" that plugs into the
/// <see cref="ICustomerRepository"/> abstraction the Application layer depends on.
///
/// Storage is a thread-safe <see cref="ConcurrentDictionary{TKey,TValue}"/> kept
/// in RAM. We register this as a SINGLETON in DI so the same dictionary lives for
/// the whole app lifetime — data survives across requests, but resets when the
/// API restarts. Swap this class for an EF Core / SQL version later and nothing
/// else in the app has to change.
/// </summary>
public class InMemoryCustomerRepository : ICustomerRepository
{
    private readonly ConcurrentDictionary<Guid, Customer> _customers = new();

    public InMemoryCustomerRepository()
    {
        // Seed a couple of sample records so the UI has something to show on
        // first run.
        Seed(Customer.Create("Ada", "Lovelace", "ada@example.com", "+1-202-555-0143"));
        Seed(Customer.Create("Alan", "Turing", "alan@example.com", "+44-20-7946-0958"));
    }

    private void Seed(Customer customer) => _customers[customer.Id] = customer;

    public Task<IReadOnlyList<Customer>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        // Hide soft-deleted records from normal listing.
        IReadOnlyList<Customer> result = _customers.Values
            .Where(c => !c.IsDeleted)
            .OrderBy(c => c.FirstName)
            .ToList();

        // The interface is async (to allow a real DB later), but our in-memory
        // work is synchronous, so we just wrap the result in a completed Task.
        return Task.FromResult(result);
    }

    public Task<Customer?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        _customers.TryGetValue(id, out var customer);

        // Treat soft-deleted as "not found" for normal reads.
        if (customer is null || customer.IsDeleted)
        {
            return Task.FromResult<Customer?>(null);
        }

        return Task.FromResult<Customer?>(customer);
    }

    public Task AddAsync(Customer customer, CancellationToken cancellationToken = default)
    {
        _customers[customer.Id] = customer;
        return Task.CompletedTask;
    }

    public Task UpdateAsync(Customer customer, CancellationToken cancellationToken = default)
    {
        // The dictionary stores the same object reference the handler edited, but
        // we re-assign explicitly to mirror how a real "save" would behave.
        _customers[customer.Id] = customer;
        return Task.CompletedTask;
    }
}
