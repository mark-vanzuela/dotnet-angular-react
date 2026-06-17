namespace CustomerApi.Api.Contracts;

/// <summary>
/// The JSON body for POST /api/customers. We keep separate request models at the
/// API edge (rather than binding straight to the MediatR command) so the public
/// HTTP contract is decoupled from the internal application command.
/// </summary>
public record CreateCustomerRequest(string FirstName, string LastName, string Email, string Phone);

/// <summary>
/// The JSON body for PUT /api/customers/{id}. The id comes from the URL, not the
/// body, so it is not repeated here.
/// </summary>
public record UpdateCustomerRequest(string FirstName, string LastName, string Email, string Phone);
