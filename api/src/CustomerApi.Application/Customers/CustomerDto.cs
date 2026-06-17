using CustomerApi.Domain.Customers;

namespace CustomerApi.Application.Customers;

/// <summary>
/// A DTO (Data Transfer Object) is the SHAPE we send back over the API. We keep
/// it separate from the domain <see cref="Customer"/> entity on purpose:
///   - the entity can hide/protect its internals (private setters, methods);
///   - the API contract can stay stable even if the entity changes;
///   - we never accidentally leak fields we did not mean to expose.
///
/// A C# 'record' is a concise immutable type — perfect for a read-only payload.
/// </summary>
public record CustomerDto(
    Guid Id,
    string FirstName,
    string LastName,
    string Email,
    string Phone,
    string FullName,
    DateTime CreatedAtUtc,
    DateTime UpdatedAtUtc);

/// <summary>
/// Manual mapping (entity -> DTO). We do this by hand rather than using a library
/// like AutoMapper so the data flow stays obvious and easy to follow.
/// </summary>
public static class CustomerMapping
{
    public static CustomerDto ToDto(this Customer customer) => new(
        customer.Id,
        customer.FirstName,
        customer.LastName,
        customer.Email,
        customer.Phone,
        customer.FullName,
        customer.CreatedAtUtc,
        customer.UpdatedAtUtc);
}
