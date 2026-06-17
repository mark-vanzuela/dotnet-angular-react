using CustomerApi.Application.Abstractions;
using CustomerApi.Application.Common.Exceptions;
using MediatR;
using Microsoft.Extensions.Logging;

namespace CustomerApi.Application.Features.Customers.DeleteCustomer;

public class DeleteCustomerHandler : IRequestHandler<DeleteCustomerCommand>
{
    private readonly ICustomerRepository _repository;
    private readonly ILogger<DeleteCustomerHandler> _logger;

    public DeleteCustomerHandler(ICustomerRepository repository, ILogger<DeleteCustomerHandler> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async Task Handle(DeleteCustomerCommand request, CancellationToken cancellationToken)
    {
        var customer = await _repository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw NotFoundException.ForCustomer(request.Id);

        // Soft delete: flip the flag instead of removing the record.
        customer.MarkAsDeleted();

        await _repository.UpdateAsync(customer, cancellationToken);

        _logger.LogInformation("Soft-deleted customer {CustomerId}", customer.Id);
    }
}
