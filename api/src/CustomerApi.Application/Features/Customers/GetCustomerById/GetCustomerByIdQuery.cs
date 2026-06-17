using CustomerApi.Application.Customers;
using MediatR;

namespace CustomerApi.Application.Features.Customers.GetCustomerById;

/// <summary>
/// CQRS QUERY: reads data without changing anything. Returns one customer DTO.
/// </summary>
public record GetCustomerByIdQuery(Guid Id) : IRequest<CustomerDto>;
