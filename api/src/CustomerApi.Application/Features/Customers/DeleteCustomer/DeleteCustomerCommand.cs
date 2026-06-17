using MediatR;

namespace CustomerApi.Application.Features.Customers.DeleteCustomer;

/// <summary>
/// Soft-delete command. It returns no data, so it implements IRequest (the
/// non-generic form) which MediatR treats as returning MediatR's "Unit" — a
/// stand-in for "void".
/// </summary>
public record DeleteCustomerCommand(Guid Id) : IRequest;
