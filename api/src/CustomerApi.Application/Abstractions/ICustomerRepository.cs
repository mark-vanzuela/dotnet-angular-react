using CustomerApi.Domain.Customers;

namespace CustomerApi.Application.Abstractions;

/// <summary>
/// The Repository Pattern: this interface describes WHAT we can do with stored
/// customers, without saying HOW or WHERE they are stored. The Application layer
/// depends only on this contract.
///
/// The actual implementation (in the Infrastructure layer) could be in-memory,
/// SQL Server, MongoDB, a file — the rest of the app neither knows nor cares.
/// This is the "Dependency Inversion" principle: high-level code depends on an
/// abstraction, and the low-level detail plugs in behind it.
/// </summary>
public interface ICustomerRepository
{
    /// <summary>All customers that have NOT been soft-deleted.</summary>
    Task<IReadOnlyList<Customer>> GetAllAsync(CancellationToken cancellationToken = default);

    /// <summary>A single customer by id, or null if missing/soft-deleted.</summary>
    Task<Customer?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task AddAsync(Customer customer, CancellationToken cancellationToken = default);

    /// <summary>Persists changes made to an existing tracked customer.</summary>
    Task UpdateAsync(Customer customer, CancellationToken cancellationToken = default);
}
