using CustomerApi.Application.Customers;
using MediatR;

namespace CustomerApi.Application.Features.Customers.GetCustomers;

/// <summary>
/// Query for the full list of (non-deleted) customers. It carries no parameters.
/// </summary>
public record GetCustomersQuery() : IRequest<IReadOnlyList<CustomerDto>>;
