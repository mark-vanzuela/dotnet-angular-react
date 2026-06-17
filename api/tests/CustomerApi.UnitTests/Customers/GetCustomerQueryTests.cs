using CustomerApi.Application.Common.Exceptions;
using CustomerApi.Application.Features.Customers.GetCustomerById;
using CustomerApi.Application.Features.Customers.GetCustomers;
using CustomerApi.Domain.Customers;
using CustomerApi.Infrastructure.Persistence;
using FluentAssertions;

namespace CustomerApi.UnitTests.Customers;

public class GetCustomerQueryTests
{
    [Fact]
    public async Task GetById_ReturnsCustomer_WhenPresent()
    {
        var repository = new InMemoryCustomerRepository();
        var customer = Customer.Create("Read", "Me", "read@example.com", "123");
        await repository.AddAsync(customer);
        var handler = new GetCustomerByIdHandler(repository);

        var result = await handler.Handle(new GetCustomerByIdQuery(customer.Id), CancellationToken.None);

        result.Id.Should().Be(customer.Id);
        result.Email.Should().Be("read@example.com");
    }

    [Fact]
    public async Task GetById_Throws_WhenMissing()
    {
        var repository = new InMemoryCustomerRepository();
        var handler = new GetCustomerByIdHandler(repository);

        var act = () => handler.Handle(new GetCustomerByIdQuery(Guid.NewGuid()), CancellationToken.None);

        await act.Should().ThrowAsync<NotFoundException>();
    }

    [Fact]
    public async Task GetAll_ReturnsSeededCustomers()
    {
        // The repository seeds two sample customers in its constructor.
        var repository = new InMemoryCustomerRepository();
        var handler = new GetCustomersHandler(repository);

        var result = await handler.Handle(new GetCustomersQuery(), CancellationToken.None);

        result.Should().HaveCountGreaterThanOrEqualTo(2);
        result.Should().OnlyContain(c => !string.IsNullOrWhiteSpace(c.Email));
    }
}
