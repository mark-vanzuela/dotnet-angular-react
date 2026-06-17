using CustomerApi.Application.Features.Customers.CreateCustomer;
using FluentAssertions;

namespace CustomerApi.UnitTests.Customers;

/// <summary>
/// Validators are pure logic, so they are very easy to unit test directly.
/// </summary>
public class CreateCustomerValidatorTests
{
    private readonly CreateCustomerValidator _validator = new();

    [Fact]
    public void Valid_command_passes()
    {
        var command = new CreateCustomerCommand("Ada", "Lovelace", "ada@example.com", "+1-202-555-0143");

        var result = _validator.Validate(command);

        result.IsValid.Should().BeTrue();
    }

    [Theory]
    [InlineData("", "Lovelace", "ada@example.com", "123")]   // missing first name
    [InlineData("Ada", "", "ada@example.com", "123")]        // missing last name
    [InlineData("Ada", "Lovelace", "not-an-email", "123")]   // bad email
    [InlineData("Ada", "Lovelace", "ada@example.com", "")]   // missing phone
    public void Invalid_command_fails(string first, string last, string email, string phone)
    {
        var command = new CreateCustomerCommand(first, last, email, phone);

        var result = _validator.Validate(command);

        result.IsValid.Should().BeFalse();
    }
}
