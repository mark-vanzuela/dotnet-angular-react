using CustomerApi.Application.Abstractions;
using CustomerApi.Application.Common.Exceptions;
using CustomerApi.Application.Customers;
using MediatR;

namespace CustomerApi.Application.Features.Customers.GetCustomerById;

public class GetCustomerByIdHandler : IRequestHandler<GetCustomerByIdQuery, CustomerDto>
{
    private readonly ICustomerRepository _repository;

    public GetCustomerByIdHandler(ICustomerRepository repository)
    {
        _repository = repository;
    }

    public async Task<CustomerDto> Handle(GetCustomerByIdQuery request, CancellationToken cancellationToken)
    {
        var customer = await _repository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw NotFoundException.ForCustomer(request.Id);

        return customer.ToDto();
    }
}
