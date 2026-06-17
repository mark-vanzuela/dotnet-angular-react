using CustomerApi.Application.Common.Exceptions;
using CustomerApi.Application.Features.Customers.DeleteCustomer;
using CustomerApi.Application.Features.Customers.GetCustomers;
using CustomerApi.Domain.Customers;
using CustomerApi.Infrastructure.Persistence;
using FluentAssertions;
using Microsoft.Extensions.Logging.Abstractions;

namespace CustomerApi.UnitTests.Customers;

public class DeleteCustomerHandlerTests
{
    [Fact]
    public async Task Handle_SoftDeletes_AndRemovesFromListing()
    {
        // Arrange
        var repository = new InMemoryCustomerRepository();
        var customer = Customer.Create("Temp", "Person", "temp@example.com", "123");
        await repository.AddAsync(customer);

        var deleteHandler = new DeleteCustomerHandler(repository, NullLogger<DeleteCustomerHandler>.Instance);
        var listHandler = new GetCustomersHandler(repository);

        // Act
        await deleteHandler.Handle(new DeleteCustomerCommand(customer.Id), CancellationToken.None);
        var list = await listHandler.Handle(new GetCustomersQuery(), CancellationToken.None);

        // Assert — the record still exists (soft delete) but no longer appears.
        list.Should().NotContain(c => c.Id == customer.Id);
        (await repository.GetByIdAsync(customer.Id)).Should().BeNull();
    }

    [Fact]
    public async Task Handle_Throws_WhenCustomerMissing()
    {
        var repository = new InMemoryCustomerRepository();
        var handler = new DeleteCustomerHandler(repository, NullLogger<DeleteCustomerHandler>.Instance);

        var act = () => handler.Handle(new DeleteCustomerCommand(Guid.NewGuid()), CancellationToken.None);

        await act.Should().ThrowAsync<NotFoundException>();
    }
}
