namespace CustomerApi.Domain.Customers;

/// <summary>
/// The core business entity. In Clean Architecture this lives in the innermost
/// layer (Domain) and has ZERO dependencies on other projects, frameworks, or
/// infrastructure. Everything else points inward toward this.
///
/// Note the soft-delete approach: we never physically remove a customer. Instead
/// we flip <see cref="IsDeleted"/> to true, so the record still exists for audit
/// history but is hidden from normal queries.
/// </summary>
public class Customer
{
    // 'private set' means only this class can change these values (via the
    // methods below). Callers cannot reach in and mutate state directly, which
    // keeps the entity in control of its own invariants.
    public Guid Id { get; private set; }
    public string FirstName { get; private set; }
    public string LastName { get; private set; }
    public string Email { get; private set; }
    public string Phone { get; private set; }

    public bool IsDeleted { get; private set; }
    public DateTime CreatedAtUtc { get; private set; }
    public DateTime UpdatedAtUtc { get; private set; }

    // A convenience read-only property. There is no backing field — it is
    // computed every time it is read.
    public string FullName => $"{FirstName} {LastName}";

    // Private parameterless constructor keeps callers from creating an
    // "empty" customer. They must go through the factory method below.
    private Customer()
    {
        FirstName = string.Empty;
        LastName = string.Empty;
        Email = string.Empty;
        Phone = string.Empty;
    }

    /// <summary>
    /// Factory method to create a brand-new customer. Using a static factory
    /// (instead of a public constructor) gives the entity a single, named entry
    /// point and lets it set audit fields itself.
    /// </summary>
    public static Customer Create(string firstName, string lastName, string email, string phone)
    {
        return new Customer
        {
            Id = Guid.NewGuid(),
            FirstName = firstName,
            LastName = lastName,
            Email = email,
            Phone = phone,
            IsDeleted = false,
            CreatedAtUtc = DateTime.UtcNow,
            UpdatedAtUtc = DateTime.UtcNow
        };
    }

    /// <summary>Applies an edit and bumps the "updated" timestamp.</summary>
    public void Update(string firstName, string lastName, string email, string phone)
    {
        FirstName = firstName;
        LastName = lastName;
        Email = email;
        Phone = phone;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    /// <summary>Soft delete: hide the record without destroying it.</summary>
    public void MarkAsDeleted()
    {
        IsDeleted = true;
        UpdatedAtUtc = DateTime.UtcNow;
    }
}
