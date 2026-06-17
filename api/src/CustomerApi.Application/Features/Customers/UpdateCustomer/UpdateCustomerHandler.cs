using CustomerApi.Application.Abstractions;
using CustomerApi.Application.Common.Exceptions;
using CustomerApi.Application.Customers;
using MediatR;
using Microsoft.Extensions.Logging;

namespace CustomerApi.Application.Features.Customers.UpdateCustomer;

public class UpdateCustomerHandler : IRequestHandler<UpdateCustomerCommand, CustomerDto>
{
    private readonly ICustomerRepository _repository;
    private readonly ILogger<UpdateCustomerHandler> _logger;

    public UpdateCustomerHandler(ICustomerRepository repository, ILogger<UpdateCustomerHandler> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async Task<CustomerDto> Handle(UpdateCustomerCommand request, CancellationToken cancellationToken)
    {
        // Fetch the existing customer first. If it is gone (or soft-deleted),
        // throw — the API turns this into a 404.
        var customer = await _repository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw NotFoundException.ForCustomer(request.Id);

        // The entity applies its own change and refreshes its timestamp.
        customer.Update(request.FirstName, request.LastName, request.Email, request.Phone);

        await _repository.UpdateAsync(customer, cancellationToken);

        _logger.LogInformation("Updated customer {CustomerId}", customer.Id);

        return customer.ToDto();
    }
}
