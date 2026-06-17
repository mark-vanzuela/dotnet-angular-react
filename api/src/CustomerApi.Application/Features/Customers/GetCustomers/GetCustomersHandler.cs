using CustomerApi.Application.Abstractions;
using CustomerApi.Application.Customers;
using MediatR;

namespace CustomerApi.Application.Features.Customers.GetCustomers;

public class GetCustomersHandler : IRequestHandler<GetCustomersQuery, IReadOnlyList<CustomerDto>>
{
    private readonly ICustomerRepository _repository;

    public GetCustomersHandler(ICustomerRepository repository)
    {
        _repository = repository;
    }

    public async Task<IReadOnlyList<CustomerDto>> Handle(GetCustomersQuery request, CancellationToken cancellationToken)
    {
        var customers = await _repository.GetAllAsync(cancellationToken);

        // Project each entity to a DTO. LINQ's Select is a "map" operation.
        return customers.Select(customer => customer.ToDto()).ToList();
    }
}
