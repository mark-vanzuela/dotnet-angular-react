using CustomerApi.Application.Abstractions;
using CustomerApi.Application.Features.Customers.CreateCustomer;
using CustomerApi.Domain.Customers;
using FluentAssertions;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;

namespace CustomerApi.UnitTests.Customers;

/// <summary>
/// Unit tests for the create handler. We MOCK the repository with Moq so the test
/// is isolated from any real storage — we only verify the handler's own logic and
/// that it asks the repository to save.
/// </summary>
public class CreateCustomerHandlerTests
{
    [Fact]
    public async Task Handle_ReturnsDto_WithProvidedValues()
    {
        // Arrange
        var repository = new Mock<ICustomerRepository>();
        var handler = new CreateCustomerHandler(repository.Object, NullLogger<CreateCustomerHandler>.Instance);
        var command = new CreateCustomerCommand("Grace", "Hopper", "grace@example.com", "+1-202-555-0100");

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.FirstName.Should().Be("Grace");
        result.LastName.Should().Be("Hopper");
        result.Email.Should().Be("grace@example.com");
        result.FullName.Should().Be("Grace Hopper");
        result.Id.Should().NotBeEmpty();
    }

    [Fact]
    public async Task Handle_SavesCustomer_ToRepository()
    {
        // Arrange
        var repository = new Mock<ICustomerRepository>();
        var handler = new CreateCustomerHandler(repository.Object, NullLogger<CreateCustomerHandler>.Instance);
        var command = new CreateCustomerCommand("Grace", "Hopper", "grace@example.com", "+1-202-555-0100");

        // Act
        await handler.Handle(command, CancellationToken.None);

        // Assert — the handler must call AddAsync exactly once with a real customer.
        repository.Verify(r => r.AddAsync(It.IsAny<Customer>(), It.IsAny<CancellationToken>()), Times.Once);
    }
}
