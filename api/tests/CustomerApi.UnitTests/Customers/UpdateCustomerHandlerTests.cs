using CustomerApi.Application.Common.Exceptions;
using CustomerApi.Application.Features.Customers.UpdateCustomer;
using CustomerApi.Domain.Customers;
using CustomerApi.Infrastructure.Persistence;
using FluentAssertions;
using Microsoft.Extensions.Logging.Abstractions;

namespace CustomerApi.UnitTests.Customers;

/// <summary>
/// These tests use the REAL in-memory repository. It is deterministic and lets us
/// verify end-to-end behaviour (the handler + the store working together).
/// </summary>
public class UpdateCustomerHandlerTests
{
    [Fact]
    public async Task Handle_UpdatesExistingCustomer()
    {
        // Arrange — start with a known customer in the store.
        var repository = new InMemoryCustomerRepository();
        var existing = Customer.Create("Old", "Name", "old@example.com", "111");
        await repository.AddAsync(existing);

        var handler = new UpdateCustomerHandler(repository, NullLogger<UpdateCustomerHandler>.Instance);
        var command = new UpdateCustomerCommand(existing.Id, "New", "Name", "new@example.com", "999");

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.FirstName.Should().Be("New");
        result.Email.Should().Be("new@example.com");
        result.Phone.Should().Be("999");
    }

    [Fact]
    public async Task Handle_Throws_WhenCustomerMissing()
    {
        var repository = new InMemoryCustomerRepository();
        var handler = new UpdateCustomerHandler(repository, NullLogger<UpdateCustomerHandler>.Instance);
        var command = new UpdateCustomerCommand(Guid.NewGuid(), "X", "Y", "x@example.com", "1");

        // Act
        var act = () => handler.Handle(command, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<NotFoundException>();
    }
}
