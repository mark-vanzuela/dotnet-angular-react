namespace CustomerApi.Application.Common.Exceptions;

/// <summary>
/// Thrown when a requested entity does not exist. The API layer translates this
/// into an HTTP 404 response (see the controller). Using a dedicated exception
/// type keeps the handlers clean — they just throw, and the edge maps it.
/// </summary>
public class NotFoundException : Exception
{
    public NotFoundException(string message) : base(message)
    {
    }

    public static NotFoundException ForCustomer(Guid id) =>
        new($"Customer with id '{id}' was not found.");
}
