using CustomerApi.Application.Abstractions;
using CustomerApi.Application.Customers;
using CustomerApi.Domain.Customers;
using MediatR;
using Microsoft.Extensions.Logging;

namespace CustomerApi.Application.Features.Customers.CreateCustomer;

/// <summary>
/// The HANDLER contains the business logic for one command. MediatR finds it by
/// matching IRequestHandler&lt;CreateCustomerCommand, CustomerDto&gt;.
///
/// Dependencies (the repository and a logger) arrive through the constructor —
/// this is Dependency Injection. The handler asks for what it needs and the DI
/// container supplies it.
/// </summary>
public class CreateCustomerHandler : IRequestHandler<CreateCustomerCommand, CustomerDto>
{
    private readonly ICustomerRepository _repository;
    private readonly ILogger<CreateCustomerHandler> _logger;

    public CreateCustomerHandler(ICustomerRepository repository, ILogger<CreateCustomerHandler> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async Task<CustomerDto> Handle(CreateCustomerCommand request, CancellationToken cancellationToken)
    {
        // The entity creates itself through its factory method (see Customer.Create).
        var customer = Customer.Create(request.FirstName, request.LastName, request.Email, request.Phone);

        await _repository.AddAsync(customer, cancellationToken);

        // Structured logging: the {Placeholders} become searchable fields, not
        // just text. This line prints to the console (configured in the API).
        _logger.LogInformation("Created customer {CustomerId} ({Email})", customer.Id, customer.Email);

        return customer.ToDto();
    }
}
