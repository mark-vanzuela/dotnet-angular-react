using CustomerApi.Application.Customers;
using MediatR;

namespace CustomerApi.Application.Features.Customers.CreateCustomer;

/// <summary>
/// CQRS = Command Query Responsibility Segregation. A COMMAND changes state
/// (create/update/delete). This one carries the data needed to create a customer.
///
/// "IRequest&lt;CustomerDto&gt;" tells MediatR: when someone sends this command,
/// route it to the matching handler, which returns a CustomerDto.
/// </summary>
public record CreateCustomerCommand(
    string FirstName,
    string LastName,
    string Email,
    string Phone) : IRequest<CustomerDto>;
