using CustomerApi.Application.Customers;
using MediatR;

namespace CustomerApi.Application.Features.Customers.UpdateCustomer;

/// <summary>
/// Command to edit an existing customer. The Id says WHICH customer; the rest is
/// the new data. Returns the updated customer as a DTO.
/// </summary>
public record UpdateCustomerCommand(
    Guid Id,
    string FirstName,
    string LastName,
    string Email,
    string Phone) : IRequest<CustomerDto>;
